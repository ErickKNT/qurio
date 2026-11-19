from io import BytesIO
from reportlab.graphics import renderPDF, renderSVG
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas

from app.modules.certificates.schemas import CertificateDTO


def generate_certificate_qr_svg(verify_url: str, size: int = 112) -> str:
    """Genera un QR SVG vectorial de alto contraste para embeber en constancias web."""
    qr_widget = QrCodeWidget(
        verify_url,
        barFillColor=colors.HexColor("#DEE1F9"),
        barBorder=0,
    )
    bounds = qr_widget.getBounds()
    qr_w = max(1.0, bounds[2] - bounds[0])
    qr_h = max(1.0, bounds[3] - bounds[1])
    drawing = Drawing(
        size,
        size,
        transform=[size / qr_w, 0, 0, size / qr_h, -bounds[0] * (size / qr_w), -bounds[1] * (size / qr_h)],
    )
    drawing.add(qr_widget)
    raw = renderSVG.drawToString(drawing)
    return raw.decode("utf-8") if isinstance(raw, bytes) else raw


def _draw_corner_bracket(c: canvas.Canvas, x: float, y: float, dx: float, dy: float, color: colors.Color) -> None:
    """Dibuja los rosetones técnicos de esquina del lienzo Terminal Glow Minimal."""
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(1.2)
    c.line(x, y, x + 16 * dx, y)
    c.line(x, y, x, y + 16 * dy)
    c.line(x, y, x + 11 * dx, y + 11 * dy)
    c.circle(x, y, 1.8, stroke=0, fill=1)
    c.restoreState()


def generate_certificate_pdf(cert: CertificateDTO) -> bytes:
    """
    Genera una constancia vectorial PDF (A4 apaisado) fiel al diseño Terminal Glow Minimal
    de Qurio: lienzo oscuro #080D1D, retícula SVG técnica, 4 métricas validadas,
    firmas vectoriales, sello holográfico QR escaneable y huella SHA-256.
    """
    buffer = BytesIO()
    width, height = landscape(A4)  # ~841.89 x 595.28 pt
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    c.setTitle(f"Constancia Qurio - {cert.track_title} - {cert.recipient_name}")
    c.setAuthor("Qurio Learning Platform")

    # Tokens de color Terminal Glow Minimal (docs/constancias/DESIGN.md)
    bg_canvas = colors.HexColor("#0E1323")
    bg_frame = colors.HexColor("#080D1D")
    surface_low = colors.HexColor("#161B2B")
    surface_container = colors.HexColor("#1A1F30")
    surface_high = colors.HexColor("#25293A")
    border_subtle = colors.HexColor("#2F3446")
    outline_variant = colors.HexColor("#464554")
    on_surface = colors.HexColor("#DEE1F9")
    on_surface_variant = colors.HexColor("#C7C4D7")
    outline_muted = colors.HexColor("#908FA0")
    primary = colors.HexColor("#C0C1FF")
    primary_container = colors.HexColor("#8083FF")
    secondary = colors.HexColor("#7BD0FF")
    tertiary = colors.HexColor("#4AE176")
    amber = colors.HexColor("#F59E0B")
    grid_line = colors.HexColor("#132238")
    grid_dot = colors.HexColor("#273056")

    # Fondo completo nocturno
    c.setFillColor(bg_canvas)
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # Marco heroico exterior e interior
    outer_m = 20
    c.setFillColor(surface_container)
    c.setStrokeColor(border_subtle)
    c.setLineWidth(1.2)
    c.roundRect(outer_m, outer_m, width - 2 * outer_m, height - 2 * outer_m, 16, stroke=1, fill=1)

    m = 30
    inner_w = width - 2 * m
    inner_h = height - 2 * m
    c.setFillColor(bg_frame)
    c.setStrokeColor(outline_variant)
    c.setLineWidth(0.9)
    c.roundRect(m, m, inner_w, inner_h, 12, stroke=1, fill=1)

    # Retícula relacional punteada dentro del lienzo interior
    c.saveState()
    clip_path = c.beginPath()
    clip_path.roundRect(m, m, inner_w, inner_h, 12)
    c.clipPath(clip_path, stroke=0, fill=0)

    c.setStrokeColor(grid_line)
    c.setLineWidth(0.55)
    c.setDash(2, 5)
    step = 32
    gx = m + step
    while gx < width - m:
        c.line(gx, m, gx, height - m)
        gx += step
    gy = m + step
    while gy < height - m:
        c.line(m, gy, width - m, gy)
        gy += step
    c.setDash()

    c.setFillColor(grid_dot)
    gx = m + step
    while gx < width - m:
        gy = m + step
        while gy < height - m:
            c.circle(gx, gy, 1.0, stroke=0, fill=1)
            gy += step
        gx += step
    c.restoreState()

    # Rosetones técnicos en las 4 esquinas
    _draw_corner_bracket(c, m + 14, height - m - 14, 1, -1, outline_variant)
    _draw_corner_bracket(c, width - m - 14, height - m - 14, -1, -1, outline_variant)
    _draw_corner_bracket(c, m + 14, m + 14, 1, 1, outline_variant)
    _draw_corner_bracket(c, width - m - 14, m + 14, -1, 1, outline_variant)

    # Cabecera institucional superior izquierda (Isotipo Qurio + Nombre)
    top_y = height - m - 48
    left_x = m + 34

    c.setFillColor(surface_container)
    c.setStrokeColor(border_subtle)
    c.setLineWidth(0.8)
    c.roundRect(left_x, top_y - 6, 34, 34, 8, stroke=1, fill=1)

    logo_cx = left_x + 17
    logo_cy = top_y + 11
    c.setStrokeColor(secondary)
    c.setLineWidth(1.3)
    c.ellipse(logo_cx - 8, logo_cy + 4, logo_cx + 8, logo_cy + 10, stroke=1, fill=0)
    c.setStrokeColor(primary_container)
    c.arc(logo_cx - 8, logo_cy - 3, logo_cx + 8, logo_cy + 4, 180, 180)
    c.setStrokeColor(secondary)
    c.arc(logo_cx - 8, logo_cy - 10, logo_cx + 8, logo_cy - 3, 180, 180)
    c.setFillColor(tertiary)
    c.circle(logo_cx, logo_cy, 1.8, stroke=0, fill=1)

    c.setFillColor(on_surface)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(left_x + 44, top_y + 13, "Qurio")
    c.setFillColor(secondary)
    c.setFont("Courier-Bold", 8)
    c.drawString(left_x + 44, top_y + 1, "PRÁCTICA SQL EN POSTGRESQL 16")

    # Pills de estado en esquina superior derecha
    right_x = width - m - 34
    status_text = "QA ADMIN PREVIEW" if cert.is_qa_preview else "EMITIDO OFICIALMENTE"
    status_color = amber if cert.is_qa_preview else tertiary

    pill_w = 136
    c.setFillColor(surface_high)
    c.setStrokeColor(border_subtle)
    c.setLineWidth(0.8)
    c.roundRect(right_x - pill_w, top_y + 10, pill_w, 18, 9, stroke=1, fill=1)
    c.setFillColor(status_color)
    c.circle(right_x - pill_w + 11, top_y + 19, 2.5, stroke=0, fill=1)
    c.setFont("Courier-Bold", 7.5)
    c.drawString(right_x - pill_w + 18, top_y + 16.5, status_text)

    c.setFillColor(outline_muted)
    c.setFont("Courier", 8)
    c.drawRightString(right_x, top_y - 2, f"INMUTABLE • SHA-256  |  ID: {cert.verification_code}")

    # Bloque central heroico
    center_x = width / 2
    y = top_y - 32

    badge_w = 248
    c.setFillColor(surface_high)
    c.setStrokeColor(border_subtle)
    c.setLineWidth(0.8)
    c.roundRect(center_x - badge_w / 2, y - 4, badge_w, 20, 10, stroke=1, fill=1)
    c.setFillColor(primary)
    c.setFont("Courier-Bold", 8.5)
    c.drawCentredString(center_x, y + 3, "CONSTANCIA DE FINALIZACIÓN")

    y -= 24
    c.setFillColor(on_surface_variant)
    c.setFont("Helvetica", 10)
    c.drawCentredString(
        center_x,
        y,
        "Por haber completado los retos prácticos de SQL sobre PostgreSQL 16,",
    )
    y -= 13
    c.drawCentredString(
        center_x,
        y,
        "se otorga esta constancia a:",
    )

    # Nombre del titular con línea gradiente simulada
    y -= 36
    c.setFillColor(primary)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(center_x, y, cert.recipient_name[:40])

    y -= 11
    c.setStrokeColor(border_subtle)
    c.setLineWidth(1.2)
    c.line(center_x - 140, y, center_x + 140, y)
    c.setStrokeColor(primary_container)
    c.setLineWidth(1.8)
    c.line(center_x - 85, y, center_x + 85, y)

    # Título de certificación / ruta
    y -= 24
    c.setFillColor(on_surface)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(center_x, y, cert.track_title[:76])

    # 4 Tarjetas de Métricas Auditadas
    y -= 66
    grid_w = inner_w - 88
    gap = 12
    card_w = (grid_w - 3 * gap) / 4
    card_h = 54
    start_x = m + 44

    pct = round((cert.completed_exercises / max(1, cert.total_exercises)) * 100)
    metrics = [
        ("TEMARIO", f"{cert.modules_count} módulos", f"{pct}% completado", tertiary),
        ("POSTGRES 16", f"{cert.completed_exercises} / {cert.total_exercises} retos", "Evaluación en sandbox", tertiary),
        ("VALIDACIÓN", "SQLGlot + Sandbox", "Resultados reales", primary),
        ("ENTORNO", "PostgreSQL 16", "Contenedor aislado", on_surface_variant),
    ]

    for idx, (lbl, val, sub, sub_color) in enumerate(metrics):
        cx = start_x + idx * (card_w + gap)
        c.setFillColor(surface_low)
        c.setStrokeColor(border_subtle)
        c.setLineWidth(0.8)
        c.roundRect(cx, y, card_w, card_h, 8, stroke=1, fill=1)

        c.setFillColor(outline_muted)
        c.setFont("Courier-Bold", 7.5)
        c.drawString(cx + 12, y + card_h - 15, lbl)

        c.setFillColor(on_surface)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(cx + 12, y + 22, val)

        c.setFillColor(sub_color)
        c.setFont("Courier", 8)
        c.drawString(cx + 12, y + 9, sub)

    # Franja de firmas digitales y sello QR central
    sig_y = m + 56
    sig_h = 104
    c.setFillColor(colors.HexColor("#101525"))
    c.setStrokeColor(border_subtle)
    c.setLineWidth(0.8)
    c.roundRect(start_x, sig_y, grid_w, sig_h, 10, stroke=1, fill=1)

    # Firma izquierda
    sig1_cx = start_x + grid_w * 0.20
    c.saveState()
    c.setStrokeColor(secondary)
    c.setLineWidth(1.5)
    p1 = c.beginPath()
    p1.moveTo(sig1_cx - 46, sig_y + 52)
    p1.curveTo(sig1_cx - 26, sig_y + 72, sig1_cx - 12, sig_y + 40, sig1_cx + 2, sig_y + 62)
    p1.curveTo(sig1_cx + 16, sig_y + 78, sig1_cx + 30, sig_y + 46, sig1_cx + 46, sig_y + 64)
    c.drawPath(p1, stroke=1, fill=0)
    c.restoreState()

    c.setStrokeColor(outline_variant)
    c.setLineWidth(0.8)
    c.line(sig1_cx - 56, sig_y + 42, sig1_cx + 56, sig_y + 42)
    c.setFillColor(on_surface)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(sig1_cx, sig_y + 28, "Evaluador Semántico Qurio")
    c.setFillColor(outline_muted)
    c.setFont("Courier", 7.5)
    c.drawCentredString(sig1_cx, sig_y + 16, "PostgreSQL 16 Sandbox Engine")

    # Sello Holográfico Central con QR Escaneable Real
    seal_cx = center_x
    seal_cy = sig_y + 60
    c.saveState()
    c.setFillColor(surface_high)
    c.setStrokeColor(secondary)
    c.setLineWidth(0.8)
    c.setDash(3, 3)
    c.circle(seal_cx, seal_cy, 34, stroke=1, fill=1)
    c.setDash()
    c.restoreState()

    # Fondo claro compacto para legibilidad garantizada de escáner móvil
    qr_pad = 46
    c.setFillColor(on_surface)
    c.roundRect(seal_cx - qr_pad / 2, seal_cy - qr_pad / 2, qr_pad, qr_pad, 6, stroke=0, fill=1)

    qr_size = 40
    qr_widget = QrCodeWidget(cert.verify_url, barFillColor=bg_frame, barBorder=0)
    bounds = qr_widget.getBounds()
    qr_w = max(1.0, bounds[2] - bounds[0])
    qr_h = max(1.0, bounds[3] - bounds[1])
    drawing = Drawing(
        qr_size,
        qr_size,
        transform=[qr_size / qr_w, 0, 0, qr_size / qr_h, -bounds[0] * (qr_size / qr_w), -bounds[1] * (qr_size / qr_h)],
    )
    drawing.add(qr_widget)
    renderPDF.draw(drawing, c, seal_cx - qr_size / 2, seal_cy - qr_size / 2)

    c.setFillColor(secondary)
    c.setFont("Courier-Bold", 8)
    c.drawCentredString(seal_cx, sig_y + 11, "QURIO VERIFIED")

    # Firma derecha
    sig2_cx = start_x + grid_w * 0.80
    c.saveState()
    c.setStrokeColor(primary)
    c.setLineWidth(1.5)
    p2 = c.beginPath()
    p2.moveTo(sig2_cx - 44, sig_y + 62)
    p2.curveTo(sig2_cx - 24, sig_y + 42, sig2_cx - 6, sig_y + 72, sig2_cx + 12, sig_y + 54)
    p2.curveTo(sig2_cx + 26, sig_y + 40, sig2_cx + 36, sig_y + 68, sig2_cx + 46, sig_y + 52)
    c.drawPath(p2, stroke=1, fill=0)
    c.setFillColor(primary)
    c.circle(sig2_cx + 49, sig_y + 52, 1.8, stroke=0, fill=1)
    c.restoreState()

    c.setStrokeColor(outline_variant)
    c.setLineWidth(0.8)
    c.line(sig2_cx - 56, sig_y + 42, sig2_cx + 56, sig_y + 42)
    c.setFillColor(on_surface)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(sig2_cx, sig_y + 28, "Equipo Qurio")
    c.setFillColor(outline_muted)
    c.setFont("Courier", 7.5)
    c.drawCentredString(sig2_cx, sig_y + 16, "Validación SQL en Sandbox")

    # Ledger Footer (SHA-256 + Emisión + Registro)
    footer_line_y = m + 38
    c.setStrokeColor(border_subtle)
    c.setLineWidth(0.7)
    c.line(start_x, footer_line_y, start_x + grid_w, footer_line_y)

    c.setFillColor(tertiary)
    c.circle(start_x + 4, m + 20, 2.5, stroke=0, fill=1)
    c.setFillColor(on_surface_variant)
    c.setFont("Courier-Bold", 7.5)
    c.drawString(start_x + 12, m + 17.5, "HASH SHA-256:")
    c.setFillColor(outline_muted)
    c.setFont("Courier", 7.5)
    digest_display = (cert.sha256_hash or cert.verification_code)[:46]
    c.drawString(start_x + 76, m + 17.5, f"{digest_display}...")

    issued_str = cert.issued_at.strftime("%d %b %Y").upper()
    c.setFillColor(outline_muted)
    c.setFont("Courier", 7.5)
    c.drawRightString(
        start_x + grid_w,
        m + 17.5,
        f"EMITIDO: {issued_str}   •   REG: #{cert.verification_code}   •   VERIFICAR: {cert.verify_url}",
    )

    c.showPage()
    c.save()
    return buffer.getvalue()
