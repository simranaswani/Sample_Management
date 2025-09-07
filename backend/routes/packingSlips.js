const express = require('express');
const router = express.Router();
const PackingSlip = require('../models/PackingSlip');
const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

// Create new packing slip
router.post('/', async (req, res) => {
  try {
    console.log('Creating packing slip with data:', JSON.stringify(req.body, null, 2));
    
    // Generate unique packing slip number in format PS-{financial_year}{count}
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 0-based month
    
    // Indian financial year starts from April (month 4)
    // If current month is April or later, use current year, otherwise use previous year
    const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1;
    const financialYearShort = financialYear.toString().slice(-2) + (financialYear + 1).toString().slice(-2);
    
    // Get the count of existing packing slips for this financial year
    const existingSlips = await PackingSlip.find({
      packingSlipNumber: { $regex: `^PS-${financialYearShort}` }
    }).sort({ packingSlipNumber: -1 });
    
    // Get the next count number
    let nextCount = 1;
    if (existingSlips.length > 0) {
      const lastSlipNumber = existingSlips[0].packingSlipNumber;
      const lastCount = parseInt(lastSlipNumber.split('-')[1].slice(4));
      nextCount = lastCount + 1;
    }
    
    const packingSlipNumber = `PS-${financialYearShort}${nextCount.toString().padStart(4, '0')}`;
    
    // Add packing slip number to the request body
    const packingSlipData = {
      ...req.body,
      packingSlipNumber: packingSlipNumber
    };
    
    const packingSlip = new PackingSlip(packingSlipData);
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

// Get receiver history - unique merchant/design combinations sent to each receiver
router.get('/receiver-history', async (req, res) => {
  try {
    // Get all dispatched packing slips (have courier and docNo)
    const dispatchedSlips = await PackingSlip.find({
      courier: { $exists: true, $ne: null, $ne: '' },
      docNo: { $exists: true, $ne: null, $ne: '' }
    });

    // Process the data to group by receiver and aggregate unique combinations
    const receiverHistory = {};

    dispatchedSlips.forEach(slip => {
      const receiverName = slip.receiverName;
      
      if (!receiverHistory[receiverName]) {
        receiverHistory[receiverName] = {
          receiverName: receiverName,
          totalPackingSlips: 0,
          combinations: {}
        };
      }

      receiverHistory[receiverName].totalPackingSlips++;

      // Process each item in the packing slip
      slip.items.forEach(item => {
        const combinationKey = `${item.merchant}|${item.designNo}`;
        
        if (!receiverHistory[receiverName].combinations[combinationKey]) {
          receiverHistory[receiverName].combinations[combinationKey] = {
            merchant: item.merchant,
            designNo: item.designNo,
            totalPieces: 0,
            packingSlipNumbers: []
          };
        }

        receiverHistory[receiverName].combinations[combinationKey].totalPieces += item.totalPieces;
        
        // Add packing slip number if not already present
        if (!receiverHistory[receiverName].combinations[combinationKey].packingSlipNumbers.includes(slip.packingSlipNumber)) {
          receiverHistory[receiverName].combinations[combinationKey].packingSlipNumbers.push(slip.packingSlipNumber);
        }
      });
    });

    // Convert to array format and sort
    const result = Object.values(receiverHistory).map(receiver => ({
      ...receiver,
      combinations: Object.values(receiver.combinations).sort((a, b) => {
        // Sort by merchant name, then by design number
        if (a.merchant !== b.merchant) {
          return a.merchant.localeCompare(b.merchant);
        }
        return a.designNo.localeCompare(b.designNo);
      })
    })).sort((a, b) => a.receiverName.localeCompare(b.receiverName));

    res.json(result);
  } catch (error) {
    console.error('Error fetching receiver history:', error);
    res.status(500).json({ error: 'Failed to fetch receiver history' });
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
    console.log('Update request for ID:', req.params.id);
    console.log('Update data:', req.body);
    
    const packingSlip = await PackingSlip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!packingSlip) {
      return res.status(404).json({ error: 'Packing slip not found' });
    }
    
    console.log('Updated packing slip:', packingSlip);
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
