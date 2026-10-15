import io
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_proposal_pdf(title: str, client_name: str, content: str, total_budget: float) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B')
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#334155')
    )

    story = []
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Prepared for: <b>{client_name}</b> | Investment: <b>${total_budget:,.2f} USD</b>", meta_style))
    story.append(Spacer(1, 15))

    # Parse content lines into paragraphs
    for line in content.split("\n"):
        clean = line.strip()
        if not clean:
            story.append(Spacer(1, 6))
            continue
        if clean.startswith("# "):
            continue # already used title
        elif clean.startswith("## ") or clean.startswith("### "):
            heading_text = clean.lstrip("#").strip()
            story.append(Paragraph(heading_text, h2_style))
        elif clean.startswith("- ") or clean.startswith("• "):
            bullet_text = "• " + clean[2:].strip()
            story.append(Paragraph(bullet_text, body_style))
        elif clean.startswith("**") and clean.endswith("**"):
            story.append(Paragraph(f"<b>{clean.strip('*')}</b>", body_style))
        else:
            # Replace bold markdown syntax **text** with <b>text</b>
            formatted = clean.replace("**", "<b>", 1)
            while "**" in formatted:
                formatted = formatted.replace("**", "</b>", 1)
                if "**" in formatted:
                    formatted = formatted.replace("**", "<b>", 1)
            story.append(Paragraph(formatted, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_invoice_pdf(invoice_number: str, client_name: str, items_json: str, total_amount: float, due_date_str: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'InvTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#1E293B')
    )
    body_style = ParagraphStyle('InvBody', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#334155'))
    bold_style = ParagraphStyle('InvBold', fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=colors.HexColor('#0F172A'))

    story = []
    story.append(Paragraph(f"INVOICE #{invoice_number}", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Billed to: <b>{client_name}</b> &nbsp;&nbsp;|&nbsp;&nbsp; Due Date: <b>{due_date_str}</b>", body_style))
    story.append(Spacer(1, 15))

    # Parse items
    try:
        items = json.loads(items_json)
    except Exception:
        items = [{"description": "Professional Freelance Services", "quantity": 1, "unit_price": total_amount, "total": total_amount}]

    table_data = [
        [Paragraph("<b>Description</b>", bold_style), Paragraph("<b>Qty</b>", bold_style), Paragraph("<b>Unit Price</b>", bold_style), Paragraph("<b>Total</b>", bold_style)]
    ]

    for item in items:
        desc = item.get("description", "Service")
        qty = item.get("quantity", 1)
        price = item.get("unit_price", 0)
        tot = item.get("total", qty * price)
        table_data.append([
            Paragraph(desc, body_style),
            Paragraph(f"{qty}", body_style),
            Paragraph(f"${price:,.2f}", body_style),
            Paragraph(f"${tot:,.2f}", body_style)
        ])

    table_data.append([
        Paragraph("<b>Total Due</b>", bold_style),
        "", "",
        Paragraph(f"<b>${total_amount:,.2f} USD</b>", bold_style)
    ])

    table = Table(table_data, colWidths=[280, 50, 90, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('LINEBELOW', (0, -1), (-1, -1), 1.5, colors.HexColor('#2563EB')),
    ]))
    story.append(table)

    story.append(Spacer(1, 30))
    story.append(Paragraph("Thank you for your business! Payment can be made via direct wire or Stripe.", body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
