import pytest
import time
import jwt
from unittest.mock import MagicMock, patch
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException

from app.core.config import settings
from app.core.auth import (
    AuthenticatedUser,
    decode_jwt_token,
    get_optional_current_user,
    get_required_current_user,
)


@pytest.fixture
def ec_key_pair():
    """Genera un par de claves curvas elípticas EC SECP256R1 (P-256) para tests."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key


@pytest.fixture
def make_valid_token(ec_key_pair):
    """Crea un token ES256 firmado con la clave privada de prueba."""
    private_key, _ = ec_key_pair

    def _token(
        sub="usr_12345678-0000-0000-0000-000000000001",
        email="student@qurio.dev",
        role="authenticated",
        exp_delta=3600,
        aud="authenticated",
        iss=None,
    ):
        payload = {
            "sub": sub,
            "email": email,
            "role": role,
            "aud": aud,
            "iss": iss or settings.SUPABASE_JWT_ISSUER,
            "exp": int(time.time()) + exp_delta,
        }
        headers = {"kid": "test-key-id", "alg": "ES256"}
        return jwt.encode(payload, private_key, algorithm="ES256", headers=headers)

    return _token


@pytest.mark.asyncio
async def test_guest_user_when_no_authorization_header():
    """Sin encabezado Authorization, se retorna un usuario invitado seguro."""
    user = await get_optional_current_user(None)
    assert user.is_guest is True
    assert user.id == "guest"
    assert user.role == "anon"


@pytest.mark.asyncio
async def test_required_user_rejects_guest():
    """get_required_current_user rechaza invitados con HTTP 401."""
    with pytest.raises(HTTPException) as exc_info:
        await get_required_current_user(None)
    assert exc_info.value.status_code == 401
    assert "requiere autenticación" in exc_info.value.detail


@pytest.mark.asyncio
async def test_valid_es256_token_decodes_successfully(ec_key_pair, make_valid_token):
    """Un token ES256 válido firmado se decodifica y asigna la identidad correcta."""
    _, public_key = ec_key_pair
    token = make_valid_token(sub="uuid-student-42", email="maria@qurio.dev")

    mock_signing_key = MagicMock()
    mock_signing_key.key = public_key

    mock_client = MagicMock()
    mock_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.core.auth.get_jwk_client", return_value=mock_client):
        user = await get_optional_current_user(f"Bearer {token}")
        assert user.is_guest is False
        assert user.id == "uuid-student-42"
        assert user.email == "maria@qurio.dev"
        assert user.role == "authenticated"


@pytest.mark.asyncio
async def test_expired_token_raises_401(ec_key_pair, make_valid_token):
    """Un token expirado lanza HTTP 401 con mensaje específico."""
    _, public_key = ec_key_pair
    expired_token = make_valid_token(exp_delta=-60)  # Expiró hace 60 segundos

    mock_signing_key = MagicMock()
    mock_signing_key.key = public_key
    mock_client = MagicMock()
    mock_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.core.auth.get_jwk_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc_info:
            await get_optional_current_user(f"Bearer {expired_token}")
        assert exc_info.value.status_code == 401
        assert "expirado" in exc_info.value.detail


@pytest.mark.asyncio
async def test_wrong_audience_raises_401(ec_key_pair, make_valid_token):
    """Un token con audience incorrecta es rechazado."""
    _, public_key = ec_key_pair
    wrong_aud_token = make_valid_token(aud="evil-aud")

    mock_signing_key = MagicMock()
    mock_signing_key.key = public_key
    mock_client = MagicMock()
    mock_client.get_signing_key_from_jwt.return_value = mock_signing_key

    with patch("app.core.auth.get_jwk_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc_info:
            await get_optional_current_user(f"Bearer {wrong_aud_token}")
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_malformed_header_raises_401():
    """Un encabezado que no sea Bearer <token> se rechaza."""
    with pytest.raises(HTTPException) as exc_info:
        await get_optional_current_user("Basic dXNlcjpwYXNz")
    assert exc_info.value.status_code == 401
    assert "Bearer" in exc_info.value.detail
