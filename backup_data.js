const mongoose = require('mongoose');
const fs = require('fs');

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/sample_management';

// Sample Schema
const SampleSchema = new mongoose.Schema({
  merchant: { type: String, required: true },
  productionSampleType: { type: String, required: true },
  designNo: { type: String, required: true },
  pieces: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
  qrCodeId: { type: String, unique: true }
}, { timestamps: true });

// PackingSlip Schema
const PackingSlipSchema = new mongoose.Schema({
  receiverName: { type: String, required: true },
  brokerName: { type: String },
  packingSlipNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  courier: { type: String },
  docNo: { type: String },
  items: [
    {
      srNo: Number,
      merchant: String,
      productionSampleType: String,
      designNo: String,
      totalPieces: Number
    }
  ]
}, { timestamps: true });

async function backupData() {
  try {
    console.log('💾 Creating backup of local MongoDB data...\n');

    // Connect to local database
    const localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI);
    const LocalSample = localConnection.model('Sample', SampleSchema);
    const LocalPackingSlip = localConnection.model('PackingSlip', PackingSlipSchema);

    // Export samples
    console.log('📦 Exporting samples...');
    const samples = await LocalSample.find({});
    const samplesData = {
      collection: 'samples',
      count: samples.length,
      data: samples,
      exportedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('backup_samples.json', JSON.stringify(samplesData, null, 2));
    console.log(`   ✅ Exported ${samples.length} samples to backup_samples.json`);

    // Export packing slips
    console.log('📋 Exporting packing slips...');
    const packingSlips = await LocalPackingSlip.find({});
    const packingSlipsData = {
      collection: 'packingSlips',
      count: packingSlips.length,
      data: packingSlips,
      exportedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('backup_packing_slips.json', JSON.stringify(packingSlipsData, null, 2));
    console.log(`   ✅ Exported ${packingSlips.length} packing slips to backup_packing_slips.json`);

    // Create summary
    const summary = {
      exportDate: new Date().toISOString(),
      samples: {
        count: samples.length,
        file: 'backup_samples.json'
      },
      packingSlips: {
        count: packingSlips.length,
        file: 'backup_packing_slips.json'
      },
      totalRecords: samples.length + packingSlips.length
    };

    fs.writeFileSync('backup_summary.json', JSON.stringify(summary, null, 2));
    console.log('   ✅ Created backup_summary.json');

    await localConnection.close();

    console.log('\n🎉 Backup completed successfully!');
    console.log('📁 Backup files created:');
    console.log('   - backup_samples.json');
    console.log('   - backup_packing_slips.json');
    console.log('   - backup_summary.json');

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

// Run backup
backupData();
