const express = require('express');
const router = express.Router();
const PackingSlip = require('../models/PackingSlip');
const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

// Create new packing slip
router.post('/', async (req, res) => {
  try {
    console.log('Creating packing slip with data:', JSON.stringify(req.body, null, 2));
    const packingSlip = new PackingSlip(req.body);
    const savedSlip = await packingSlip.save();
    console.log('Saved packing slip:', JSON.stringify(savedSlip, null, 2));
    res.status(201).json(savedSlip);
  } catch (error) {
    console.error('Error creating packing slip:', error);
    res.status(500).json({ error: 'Failed to create packing slip' });
  }
});

// Get all packing slips
router.get('/', async (req, res) => {
  try {
    const packingSlips = await PackingSlip.find().sort({ date: -1 });
    res.json(packingSlips);
  } catch (error) {
    console.error('Error fetching packing slips:', error);
    res.status(500).json({ error: 'Failed to fetch packing slips' });
  }
});

// Get packing slip by ID
router.get('/:id', async (req, res) => {
  try {
    const packingSlip = await PackingSlip.findById(req.params.id);
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }
    res.json(packingSlip);
  } catch (error) {
    console.error('Error fetching packing slip:', error);
    res.status(500).json({ error: 'Failed to fetch packing slip' });
  }
});

// Generate PDF for packing slip
router.get('/:id/pdf', async (req, res) => {
  try {
    const packingSlip = await PackingSlip.findById(req.params.id);
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }

    console.log('Packing slip data:', JSON.stringify(packingSlip, null, 2));
    console.log('Items array:', packingSlip.items);
    console.log('Items length:', packingSlip.items ? packingSlip.items.length : 'undefined');

    const doc = new jsPDF();
    
    // Header with Allen Jorgio Logo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'italic');
    doc.text('Allen Jorgio', 20, 20);
    doc.setFontSize(8);
    doc.text('®', 75, 16);
    
    // Company details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Textile Manufacturing Company', 20, 30);
    doc.text('Sample Management System', 20, 37);
    
    // Packing Slip Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PACKING SLIP', 20, 50);
    
    // Packing slip details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Receiver: ${packingSlip.receiverName}`, 20, 65);
    if (packingSlip.brokerName) {
      doc.text(`Broker: ${packingSlip.brokerName}`, 20, 72);
    }
    doc.text(`Packing Slip No: ${packingSlip.packingSlipNumber}`, 20, 79);
    doc.text(`Date: ${new Date(packingSlip.date).toLocaleDateString()}`, 20, 86);
    
    // Items table
    console.log('Creating table data...');
    const tableData = packingSlip.items ? packingSlip.items.map(item => {
      console.log('Processing item:', item);
      return [
        item.srNo || '',
        item.merchant || '',
        item.productionSampleType || '',
        item.designNo || '',
        item.totalPieces || 0
      ];
    }) : [];
    
    console.log('Table data:', tableData);
    
    if (tableData.length > 0) {
      // Create table manually for now to ensure it works
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Table headers
      doc.text('Sr. No.', 20, 100);
      doc.text('Merchant', 50, 100);
      doc.text('Sample Type', 100, 100);
      doc.text('Design No.', 150, 100);
      doc.text('Pieces', 180, 100);
      
      // Draw line under headers
      doc.line(20, 105, 220, 105);
      
      // Table data
      doc.setFont('helvetica', 'normal');
      let yPos = 115;
      tableData.forEach(row => {
        doc.text(row[0].toString(), 20, yPos);
        doc.text(row[1], 50, yPos);
        doc.text(row[2], 100, yPos);
        doc.text(row[3], 150, yPos);
        doc.text(row[4].toString(), 180, yPos);
        yPos += 10;
      });
      
      console.log('Manual table created successfully');
    } else {
      doc.text('No items found', 20, 110);
    }
    
    // Footer
    let finalY;
    if (tableData.length > 0) {
      finalY = 115 + (tableData.length * 10) + 20;
    } else {
      finalY = 120;
    }
    
    doc.setFontSize(10);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, finalY);
    
    // Allen Jorgio Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Allen Jorgio® - Textile Sample Management System', 20, finalY + 10);
    
    // Generate PDF as base64 and convert to buffer
    const pdfBase64 = doc.output('datauristring');
    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
    console.log('PDF base64 length:', pdfBase64.length);
    console.log('PDF buffer size:', pdfBuffer.length);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="packing-slip-${packingSlip.packingSlipNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Update packing slip
router.put('/:id', async (req, res) => {
  try {
    const packingSlip = await PackingSlip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }
    
    res.json(packingSlip);
  } catch (error) {
    console.error('Error updating packing slip:', error);
    res.status(500).json({ error: 'Failed to update packing slip' });
  }
});

// Delete packing slip
router.delete('/:id', async (req, res) => {
  try {
    const packingSlip = await PackingSlip.findByIdAndDelete(req.params.id);
    
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }
    
    res.json({ message: 'Packing slip deleted successfully' });
  } catch (error) {
    console.error('Error deleting packing slip:', error);
    res.status(500).json({ error: 'Failed to delete packing slip' });
  }
});

module.exports = router;
