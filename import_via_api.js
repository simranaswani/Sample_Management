const fs = require('fs');
const path = require('path');

// Read the generated QR codes data
const qrDataPath = path.join(__dirname, 'generated_qr_codes', 'qr_codes_data.json');
const qrData = JSON.parse(fs.readFileSync(qrDataPath, 'utf8'));

console.log(`Found ${qrData.length} QR code records to import`);

// Prepare data for API call
const samplesToImport = qrData.map(sample => ({
  merchant: sample.merchant,
  productionSampleType: sample.productionSampleType,
  designNo: sample.designNo,
  pieces: sample.pieces,
  dateCreated: sample.dateCreated,
  qrCodeId: sample.qrCodeId
}));

// Make API call to bulk import
async function importViaAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/samples/bulk-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        samples: samplesToImport
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('\n=== IMPORT COMPLETE ===');
    console.log('API Response:', JSON.stringify(result, null, 2));

    // Save import summary
    const summaryPath = path.join(__dirname, 'generated_qr_codes', 'api_import_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(result, null, 2));
    console.log(`Import summary saved to: ${summaryPath}`);

  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('Fetch not available. Please run this script with Node.js 18+ or install node-fetch');
  console.log('Alternatively, you can manually import the data using the frontend or a tool like Postman');
  console.log('\nTo import manually:');
  console.log('1. Start your backend server (npm run dev in backend directory)');
  console.log('2. Make a POST request to http://localhost:5000/api/samples/bulk-import');
  console.log('3. Send the following JSON in the request body:');
  console.log(JSON.stringify({ samples: samplesToImport.slice(0, 3) }, null, 2));
  console.log('... (and so on for all 333 samples)');
} else {
  importViaAPI();
}
