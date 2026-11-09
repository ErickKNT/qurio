import logging
from typing import Optional
from pydantic import BaseModel
from fastapi import Header, HTTPException, status
import jwt
from jwt import PyJWKClient, PyJWTError, ExpiredSignatureError

from app.core.config import settings

logger = logging.getLogger(__name__)


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "authenticated"
    is_guest: bool = False


# Cliente JWKS en memoria con caché de claves públicas de Supabase
_jwk_client: Optional[PyJWKClient] = None


def get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        _jwk_client = PyJWKClient(
            settings.SUPABASE_JWKS_URL,
            cache_jwk_set=True,
            lifespan=3600,
        )
    return _jwk_client


def decode_jwt_token(token: str) -> dict:
    """
    Decodifica y valida rigurosamente un token JWT emitido por Supabase.
    Soporta claves asimétricas ES256 (vía JWKS) y HMAC HS256 (para tests/secreto simétrico).
    Valida firma, issuer, audience y fecha de expiración.
    """
    try:
        # 1. Leer encabezado del token sin verificar para identificar el algoritmo y kid
        unverified_headers = jwt.get_unverified_header(token)
        alg = unverified_headers.get("alg", "ES256")

        if alg == "ES256":
            # Validación con clave pública asimétrica vía JWKS
            client = get_jwk_client()
            signing_key = client.get_signing_key_from_jwt(token)
            key = signing_key.key
        elif alg == "HS256":
            # Validación con secreto simétrico (soporte para suites de prueba o HS256 clásico)
            if not settings.SUPABASE_JWT_SECRET:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="El algoritmo de firma no es compatible con la configuración actual del servidor.",
                )
            key = settings.SUPABASE_JWT_SECRET
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Algoritmo de firma no admitido: {alg}",
            )

        # 2. Decodificar y verificar claims estándar
        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            audience=settings.SUPABASE_JWT_AUDIENCE,
            issuer=settings.SUPABASE_JWT_ISSUER,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ha expirado. Por favor vuelve a iniciar sesión.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (PyJWTError, Exception) as e:
        logger.warning(f"Error de validación JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido o alterado.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> AuthenticatedUser:
    """
    Dependencia de FastAPI para obtener el usuario actual.
    Si no se proporciona encabezado Authorization, retorna una identidad de invitado (Guest).
    Si se proporciona, valida estrictamente el JWT de Supabase.
    """
    if not authorization or not authorization.strip():
        return AuthenticatedUser(
            id="guest",
            email=None,
            role="anon",
            is_guest=True,
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Encabezado de autorización con formato incorrecto. Debe ser: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_jwt_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token no contiene un identificador de usuario válido ('sub').",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        is_guest=False,
    )


async def get_required_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> AuthenticatedUser:
    """
    Dependencia que exige que el usuario esté autenticado con una identidad válida.
    Rechaza el modo invitado con un error HTTP 401.
    """
    user = await get_optional_current_user(authorization)
    if user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Esta operación requiere autenticación activa con Supabase.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
