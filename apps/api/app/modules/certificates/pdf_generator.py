from io import BytesIO
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas

from app.modules.certificates.schemas import CertificateDTO


def generate_certificate_pdf(cert: CertificateDTO) -> bytes:
    """
    Genera una constancia vectorial en formato PDF (A4 apaisado) con identidad visual
    de Qurio, metadatos auditados y código QR apuntando a la URL pública de verificación.
    """
    buffer = BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    c.setTitle(f"Constancia Qurio - {cert.track_title} - {cert.recipient_name}")
    c.setAuthor("Qurio Engineering Platform")

    # Paleta oficial Qurio
    midnight = colors.HexColor("#0B1020")
    indigo = colors.HexColor("#6366F1")
    cyan = colors.HexColor("#0284C7")
    emerald = colors.HexColor("#16A34A")
    slate_dark = colors.HexColor("#0F172A")
    slate_muted = colors.HexColor("#475569")
    border_light = colors.HexColor("#CBD5E1")
    card_bg = colors.HexColor("#F8FAFC")

    # Fondo limpio imprimible + marco exterior
    c.setFillColor(colors.white)
    c.rect(0, 0, width, height, stroke=0, fill=1)

    margin = 28
    c.setStrokeColor(border_light)
    c.setLineWidth(1.5)
    c.roundRect(margin, margin, width - 2 * margin, height - 2 * margin, 14, stroke=1, fill=0)

    # Franja superior oscura Terminal Glow Minimal
    banner_h = 92
    c.setFillColor(midnight)
    c.roundRect(margin, height - margin - banner_h, width - 2 * margin, banner_h, 14, stroke=0, fill=1)
    # Cuadrar esquinas inferiores del banner
    c.rect(margin, height - margin - banner_h, width - 2 * margin, 20, stroke=0, fill=1)

    # Línea de acento cyan/indigo debajo del banner
    c.setStrokeColor(indigo)
    c.setLineWidth(3)
    c.line(margin, height - margin - banner_h, width - margin, height - margin - banner_h)

    # Isotipo geométrico Qurio en el banner
    logo_cx = margin + 46
    logo_cy = height - margin - banner_h / 2
    c.setStrokeColor(colors.HexColor("#7BD0FF"))
    c.setLineWidth(1.8)
    c.ellipse(logo_cx - 14, logo_cy + 6, logo_cx + 14, logo_cy + 16, stroke=1, fill=0)
    c.arc(logo_cx - 14, logo_cy - 6, logo_cx + 14, logo_cy + 6, 180, 180)
    c.arc(logo_cx - 14, logo_cy - 16, logo_cx + 14, logo_cy - 4, 180, 180)
    c.setFillColor(colors.HexColor("#22C55E"))
    c.circle(logo_cx, logo_cy, 3.2, stroke=0, fill=1)

    # Título de marca en banner
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin + 74, logo_cy + 4, "Qurio")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Courier", 10)
    c.drawString(margin + 74, logo_cy - 13, "POSTGRESQL 16 ENGINEERING PLATFORM")

    # Sello en esquina derecha del banner
    c.setFillColor(colors.HexColor("#22C55E"))
    c.setFont("Courier-Bold", 10)
    status_label = "QA ADMIN PREVIEW" if cert.is_qa_preview else "VERIFICADO EN SERVIDOR"
    c.drawRightString(width - margin - 28, logo_cy + 4, status_label)
    c.setFillColor(colors.HexColor("#7BD0FF"))
    c.setFont("Courier", 9.5)
    c.drawRightString(width - margin - 28, logo_cy - 13, f"ID: {cert.verification_code}")

    # Contenido central
    center_x = width / 2
    y = height - margin - banner_h - 54

    c.setFillColor(cyan)
    c.setFont("Courier-Bold", 11)
    c.drawCentredString(center_x, y, "CONSTANCIA DE FINALIZACION")

    y -= 36
    c.setFillColor(slate_dark)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(center_x, y, cert.track_title)

    y -= 34
    c.setFillColor(slate_muted)
    c.setFont("Helvetica", 12)
    c.drawCentredString(center_x, y, "Se otorga el presente reconocimiento técnico a:")

    y -= 44
    # Caja de nombre
    box_w = min(480, width - 2 * margin - 120)
    c.setFillColor(card_bg)
    c.setStrokeColor(indigo)
    c.setLineWidth(1.2)
    c.roundRect(center_x - box_w / 2, y - 14, box_w, 44, 10, stroke=1, fill=1)

    c.setFillColor(slate_dark)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(center_x, y, cert.recipient_name[:42])

    y -= 44
    c.setFillColor(slate_muted)
    c.setFont("Helvetica", 11.5)
    c.drawCentredString(
        center_x,
        y,
        f"Por haber completado y aprobado satisfactoriamente {cert.completed_exercises} de {cert.total_exercises} retos prácticos"
    )
    y -= 18
    c.drawCentredString(
        center_x,
        y,
        "evaluados semánticamente sobre el motor PostgreSQL 16 (Sandbox Docker aislado)."
    )

    # Pie de página: Fecha, URL de verificación y QR vectorial
    footer_y = margin + 32
    c.setStrokeColor(border_light)
    c.setLineWidth(1)
    c.line(margin + 28, footer_y + 72, width - margin - 28, footer_y + 72)

    issued_str = cert.issued_at.strftime("%d/%m/%Y")
    c.setFillColor(slate_dark)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(margin + 32, footer_y + 42, f"Fecha de emisión: {issued_str}")

    c.setFillColor(emerald)
    c.setFont("Courier-Bold", 10)
    c.drawString(margin + 32, footer_y + 24, "Evaluación Semántica + Inspección AST (SQLGlot)")

    c.setFillColor(slate_muted)
    c.setFont("Courier", 8.5)
    c.drawString(margin + 32, footer_y + 6, f"Verificar en: {cert.verify_url}")

    # Código QR vectorial en esquina inferior derecha
    qr_size = 70
    qr_widget = QrCodeWidget(cert.verify_url)
    bounds = qr_widget.getBounds()
    qr_w = bounds[2] - bounds[0]
    qr_h = bounds[3] - bounds[1]
    drawing = Drawing(qr_size, qr_size, transform=[qr_size / qr_w, 0, 0, qr_size / qr_h, 0, 0])
    drawing.add(qr_widget)
    renderPDF.draw(drawing, c, width - margin - 28 - qr_size, footer_y - 4)

    c.showPage()
    c.save()
    return buffer.getvalue()
