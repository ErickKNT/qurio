from unittest.mock import patch
from fastapi.testclient import TestClient

from app.core.auth import AuthenticatedUser, get_optional_current_user, get_required_current_user
from app.main import app
from app.modules.certificates.service import _LOCAL_CERT_BY_CODE, _LOCAL_CERT_BY_KEY


def _student_user() -> AuthenticatedUser:
    return AuthenticatedUser(
        id="00000000-0000-0000-0000-000000001111",
        email="student@qurio.dev",
        role="authenticated",
        is_guest=False,
        app_metadata={},
    )


def _admin_user() -> AuthenticatedUser:
    return AuthenticatedUser(
        id="00000000-0000-0000-0000-00000000a001",
        email="erickbonillamx@gmail.com",
        role="authenticated",
        is_guest=False,
        app_metadata={"role": "admin"},
    )


def test_student_cannot_issue_qa_or_incomplete_certificate():
    _LOCAL_CERT_BY_KEY.clear()
    _LOCAL_CERT_BY_CODE.clear()
    app.dependency_overrides[get_required_current_user] = _student_user

    try:
        client = TestClient(app)
        res_qa = client.post(
            "/api/v1/certificates/issue",
            json={
                "track_id": "sql-foundations",
                "track_title": "1. Fundamentos de SQL",
                "total_exercises": 24,
                "qa_preview": True,
            },
        )
        assert res_qa.status_code == 403

        with patch("app.modules.certificates.service._get_user_passed_exercise_ids", return_value=set()):
            res_incomplete = client.post(
                "/api/v1/certificates/issue",
                json={
                    "track_id": "sql-foundations",
                    "track_title": "1. Fundamentos de SQL",
                    "total_exercises": 24,
                    "qa_preview": False,
                },
            )
            assert res_incomplete.status_code == 403
    finally:
        app.dependency_overrides.clear()


def test_admin_can_issue_verify_and_download_pdf_and_linkedin_certificate():
    _LOCAL_CERT_BY_KEY.clear()
    _LOCAL_CERT_BY_CODE.clear()
    app.dependency_overrides[get_required_current_user] = _admin_user

    try:
        client = TestClient(app)
        with patch("app.modules.certificates.service._get_user_passed_exercise_ids", return_value=set()):
            res_issue = client.post(
                "/api/v1/certificates/issue",
                json={
                    "track_id": "sql-foundations",
                    "track_title": "1. Fundamentos de SQL",
                    "recipient_name": "Erick Bonilla",
                    "total_exercises": 24,
                    "qa_preview": True,
                    "verify_base_url": "https://qurio.dev",
                },
            )
        assert res_issue.status_code == 200
        data = res_issue.json()
        code = data["verification_code"]
        assert code.startswith("QURIO-QA-")
        assert data["is_qa_preview"] is True
        assert data["verify_url"] == f"https://qurio.dev/verify/{code}"
        assert data["linkedin_url"].startswith("https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME")

        # Verificación pública sin autenticación
        res_verify = client.get(f"/api/v1/certificates/{code}")
        assert res_verify.status_code == 200
        assert res_verify.json()["recipient_name"] == "Erick Bonilla"

        # Descarga PDF vectorial real
        res_pdf = client.get(f"/api/v1/certificates/{code}/pdf")
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert res_pdf.content.startswith(b"%PDF-")
    finally:
        app.dependency_overrides.clear()


def test_admin_can_reveal_solution_without_two_failed_attempts():
    client = TestClient(app)
    app.dependency_overrides[get_optional_current_user] = _student_user
    try:
        res_student = client.post(
            "/api/v1/exercises/e0000000-0000-0000-0000-000000000001/reveal-solution",
            json={"failed_attempts": 0},
        )
        assert res_student.status_code == 400

        app.dependency_overrides[get_optional_current_user] = _admin_user
        res_admin = client.post(
            "/api/v1/exercises/e0000000-0000-0000-0000-000000000001/reveal-solution",
            json={"failed_attempts": 0},
        )
        assert res_admin.status_code == 200
        assert "solution_query" in res_admin.json()
    finally:
        app.dependency_overrides.clear()
