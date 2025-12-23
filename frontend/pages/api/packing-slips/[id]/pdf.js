import connectDB from '../../../../lib/db';
import PackingSlip from '../../../../models/PackingSlip';
import { jsPDF } from 'jspdf';

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const packingSlip = await PackingSlip.findById(id);
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }

    // Generate PDF
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text('PACKING SLIP', 105, 20, { align: 'center' });
    
    // Company name
    doc.setFontSize(16);
    doc.text('Allen Jorgio', 105, 30, { align: 'center' });
    
    // Packing slip details
    doc.setFontSize(12);
    doc.text(`Packing Slip No: ${packingSlip.packingSlipNumber}`, 20, 50);
    
    // Format date as dd/mm/yyyy
    const dateObj = new Date(packingSlip.date);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    doc.text(`Date: ${formattedDate}`, 20, 60);
    
    doc.text(`Receiver: ${packingSlip.receiverName}`, 20, 70);
    if (packingSlip.brokerName) {
      doc.text(`Broker: ${packingSlip.brokerName}`, 20, 80);
    }
    
    // Items table header
    doc.setFontSize(10);
    doc.text('Sr No', 20, 100);
    doc.text('Merchant', 40, 100);
    doc.text('Type', 80, 100);
    doc.text('Design No', 120, 100);
    doc.text('Pieces', 160, 100);
    
    // Draw line under header
    doc.line(20, 105, 190, 105);
    
    // Items
    let yPosition = 115;
    let totalPieces = 0;
    
    packingSlip.items.forEach((item, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text((index + 1).toString(), 20, yPosition);
      doc.text(item.merchant || '', 40, yPosition);
      doc.text(item.productionSampleType || '', 80, yPosition);
      doc.text(item.designNo || '', 120, yPosition);
      doc.text(item.totalPieces.toString(), 160, yPosition);
      
      totalPieces += item.totalPieces;
      yPosition += 10;
    });
    
    // Total
    doc.setFontSize(12);
    doc.text(`Total Pieces: ${totalPieces}`, 120, yPosition + 10);
    
    // Footer
    
       
    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="packing-slip-${packingSlip.packingSlipNumber}.pdf"`);
    
    // Send PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.status(200).send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
