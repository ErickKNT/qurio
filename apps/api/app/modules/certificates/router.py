from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import Response

from app.core.auth import AuthenticatedUser, get_required_current_user
from app.modules.certificates.pdf_generator import generate_certificate_pdf, generate_certificate_qr_svg
from app.modules.certificates.schemas import CertificateDTO, CertificateIssueRequest
from app.modules.certificates.service import (
    get_certificate_by_code,
    issue_certificate_for_user,
    list_user_certificates,
)

router = APIRouter(prefix="/certificates", tags=["Constancias"])


def _origin_from_request(request: Request) -> str:
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/")
    return "http://localhost:5173"


@router.post("/issue", response_model=CertificateDTO)
async def issue_certificate(
    payload: CertificateIssueRequest,
    request: Request,
    user: AuthenticatedUser = Depends(get_required_current_user),
):
    """Emite de forma idempotente una constancia verificable para el usuario autenticado."""
    return await issue_certificate_for_user(
        user=user,
        payload=payload,
        default_base_url=_origin_from_request(request),
    )


@router.get("/me", response_model=List[CertificateDTO])
async def get_my_certificates(
    request: Request,
    user: AuthenticatedUser = Depends(get_required_current_user),
):
    """Lista las constancias emitidas del estudiante autenticado."""
    return await list_user_certificates(
        user_id=user.id,
        default_base_url=_origin_from_request(request),
    )


@router.get("/{verification_code}", response_model=CertificateDTO)
async def verify_certificate(verification_code: str, request: Request):
    """Endpoint público de verificación de constancia por código."""
    cert = await get_certificate_by_code(
        verification_code=verification_code,
        default_base_url=_origin_from_request(request),
    )
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ninguna constancia verificada con el código '{verification_code}'.",
        )
    return cert


@router.get("/{verification_code}/pdf")
async def download_certificate_pdf(verification_code: str, request: Request):
    """Genera y descarga el archivo PDF oficial de la constancia verificada."""
    cert = await get_certificate_by_code(
        verification_code=verification_code,
        default_base_url=_origin_from_request(request),
    )
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ninguna constancia verificada con el código '{verification_code}'.",
        )

    pdf_bytes = generate_certificate_pdf(cert)
    filename = f"constancia-qurio-{cert.verification_code.lower()}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-store",
        },
    )


@router.get("/{verification_code}/qr.svg")
async def get_certificate_qr_svg(verification_code: str, request: Request):
    """Genera un código QR SVG vectorial apuntando a la URL pública de verificación."""
    cert = await get_certificate_by_code(
        verification_code=verification_code,
        default_base_url=_origin_from_request(request),
    )
    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ninguna constancia verificada con el código '{verification_code}'.",
        )

    svg_str = generate_certificate_qr_svg(cert.verify_url)
    return Response(
        content=svg_str,
        media_type="image/svg+xml",
        headers={"Cache-Control": "public, max-age=3600"},
    )
