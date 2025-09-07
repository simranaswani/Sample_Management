const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import the Sample model
const Sample = require('./backend/models/Sample');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sample_management';

async function importQRData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read the generated QR codes data
    const qrDataPath = path.join(__dirname, 'generated_qr_codes', 'qr_codes_data.json');
    const qrData = JSON.parse(fs.readFileSync(qrDataPath, 'utf8'));

    console.log(`Found ${qrData.length} QR code records to import`);

    // Clear existing samples (optional - remove this if you want to keep existing data)
    // await Sample.deleteMany({});
    // console.log('Cleared existing samples');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Import each sample
    for (let i = 0; i < qrData.length; i++) {
      const sampleData = qrData[i];
      
      try {
        // Create new sample document
        const sample = new Sample({
          merchant: sampleData.merchant,
          productionSampleType: sampleData.productionSampleType,
          designNo: sampleData.designNo,
          pieces: sampleData.pieces,
          dateCreated: new Date(sampleData.dateCreated),
          qrCodeId: sampleData.qrCodeId
        });

        // Save to database
        await sample.save();
        successCount++;
        console.log(`✓ Imported ${i + 1}/${qrData.length}: ${sampleData.merchant} - ${sampleData.designNo}`);

      } catch (error) {
        errorCount++;
        errors.push({
          index: i + 1,
          merchant: sampleData.merchant,
          designNo: sampleData.designNo,
          error: error.message
        });
        console.error(`✗ Error importing ${i + 1}/${qrData.length}: ${sampleData.merchant} - ${sampleData.designNo}`, error.message);
      }
    }

    // Generate import summary
    const summary = {
      totalRecords: qrData.length,
      successCount: successCount,
      errorCount: errorCount,
      importedAt: new Date().toISOString(),
      errors: errors
    };

    // Save import summary
    const summaryPath = path.join(__dirname, 'generated_qr_codes', 'import_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`Total records: ${summary.totalRecords}`);
    console.log(`Successfully imported: ${summary.successCount}`);
    console.log(`Errors: ${summary.errorCount}`);
    console.log(`Import summary saved to: ${summaryPath}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(error => {
        console.log(`- Record ${error.index}: ${error.merchant} - ${error.designNo}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import
importQRData().catch(console.error);
