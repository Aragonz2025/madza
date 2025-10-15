"""
PDF Generation Service for EOBs
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Dict, Any


class PDFGenerator:
    """Generate PDF documents for EOBs"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='EOBTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='EOBSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Header style
        self.styles.add(ParagraphStyle(
            name='EOBHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            spaceAfter=10,
            textColor=colors.darkblue
        ))
        
        # Normal text style
        self.styles.add(ParagraphStyle(
            name='EOBNormal',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        ))
    
    def generate_eob_pdf(self, eob_data: Dict[str, Any]) -> BytesIO:
        """Generate PDF for EOB data"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Build the PDF content
        story = []
        
        # Title
        story.append(Paragraph("EXPLANATION OF BENEFITS", self.styles['EOBTitle']))
        story.append(Spacer(1, 12))
        
        # Insurance Company
        story.append(Paragraph(f"<b>{eob_data.get('insurance_company', 'Insurance Company')}</b>", self.styles['EOBSubtitle']))
        story.append(Spacer(1, 20))
        
        # Patient Information
        story.append(Paragraph("PATIENT INFORMATION", self.styles['EOBHeader']))
        patient_info = [
            ['Patient Name:', eob_data.get('patient_name', 'N/A')],
            ['Patient ID:', eob_data.get('patient_id', 'N/A')],
            ['EOB Date:', eob_data.get('eob_date', 'N/A')],
        ]
        patient_table = Table(patient_info, colWidths=[2*inch, 4*inch])
        patient_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 20))
        
        # Claim Information
        story.append(Paragraph("CLAIM INFORMATION", self.styles['EOBHeader']))
        claim_info = [
            ['Claim ID:', eob_data.get('claim_id', 'N/A')],
            ['Claim Amount:', f"${eob_data.get('claim_amount', 0):,.2f}"],
            ['EOB Amount:', f"${eob_data.get('eob_amount', 0):,.2f}"],
            ['Status:', eob_data.get('status', 'N/A').upper()],
        ]
        claim_table = Table(claim_info, colWidths=[2*inch, 4*inch])
        claim_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(claim_table)
        story.append(Spacer(1, 20))
        
        # AI Analysis
        ai_analysis = eob_data.get('ai_analysis', {})
        if ai_analysis:
            story.append(Paragraph("AI ANALYSIS", self.styles['EOBHeader']))
            story.append(Paragraph(ai_analysis.get('summary', 'No analysis available'), self.styles['EOBNormal']))
            
            if 'coverage_details' in ai_analysis:
                story.append(Spacer(1, 10))
                story.append(Paragraph("Coverage Details:", self.styles['EOBHeader']))
                story.append(Paragraph(ai_analysis['coverage_details'], self.styles['EOBNormal']))
            
            # Deductible, Copay, Coinsurance
            coverage_details = []
            if 'deductible_applied' in ai_analysis:
                coverage_details.append(['Deductible Applied:', f"${ai_analysis['deductible_applied']:,.2f}"])
            if 'copay_applied' in ai_analysis:
                coverage_details.append(['Copay Applied:', f"${ai_analysis['copay_applied']:,.2f}"])
            if 'coinsurance_applied' in ai_analysis:
                coverage_details.append(['Coinsurance Applied:', f"${ai_analysis['coinsurance_applied']:,.2f}"])
            
            if coverage_details:
                story.append(Spacer(1, 10))
                coverage_table = Table(coverage_details, colWidths=[2*inch, 2*inch])
                coverage_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(coverage_table)
        
        # Denial Reasons
        denial_reasons = eob_data.get('denial_reasons', [])
        if denial_reasons:
            story.append(Spacer(1, 20))
            story.append(Paragraph("DENIAL REASONS", self.styles['EOBHeader']))
            for reason in denial_reasons:
                story.append(Paragraph(f"• {reason}", self.styles['EOBNormal']))
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 
                              self.styles['EOBNormal']))
        story.append(Paragraph("This is a computer-generated EOB for demonstration purposes.", 
                              self.styles['EOBNormal']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer


# Global instance
pdf_generator = PDFGenerator()
