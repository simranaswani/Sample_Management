const fs = require('fs');
const path = require('path');

// Read the generated QR codes data
const qrDataPath = path.join(__dirname, 'generated_qr_codes', 'qr_codes_data.json');
const qrData = JSON.parse(fs.readFileSync(qrDataPath, 'utf8'));

console.log(`Converting ${qrData.length} QR code records to frontend data format`);

// Convert to frontend format
const frontendData = qrData.map((sample, index) => ({
  _id: `generated_${index + 1}`,
  merchant: sample.merchant,
  productionSampleType: sample.productionSampleType,
  designNo: sample.designNo,
  pieces: sample.pieces,
  dateCreated: sample.dateCreated,
  qrCodeId: sample.qrCodeId
}));

// Generate the frontend data file
const frontendDataContent = `// Generated QR code samples data
// This file contains the ${qrData.length} samples generated from the bulk QR code generation

export const generatedSamples = ${JSON.stringify(frontendData, null, 2)};
`;

// Write to frontend data directory
const frontendDataPath = path.join(__dirname, 'frontend', 'src', 'data', 'generatedSamples.js');
fs.writeFileSync(frontendDataPath, frontendDataContent);

console.log(`Frontend data file created: ${frontendDataPath}`);
console.log(`Total samples: ${frontendData.length}`);
console.log('Sample records:');
console.log('- ASPIRE: 246, 4919, 983, ASP001, H21733');
console.log('- BLEZZA TROVIN: RW-407');
console.log('- CELEBRITY: 42190, 4220, 5270, 5271, 5278, 5279, 5280, H21725');
console.log('- And many more...');
