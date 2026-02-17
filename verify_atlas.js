const mongoose = require('mongoose');

// Atlas MongoDB connection
const ATLAS_MONGODB_URI = 'mongodb+srv://simranaswani4292_db_user:fRz4HrcnpPjFa6Gf@samplemanagementcluster.crgxmmt.mongodb.net/SampleManagementCluster?retryWrites=true&w=majority&appName=SampleManagementCluster';

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

async function verifyAtlasData() {
  try {
    console.log('🔍 Verifying Atlas data...\n');

    // Connect to Atlas database
    const atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI);
    const AtlasSample = atlasConnection.model('Sample', SampleSchema);
    const AtlasPackingSlip = atlasConnection.model('PackingSlip', PackingSlipSchema);

    // Count documents
    const sampleCount = await AtlasSample.countDocuments();
    const packingSlipCount = await AtlasPackingSlip.countDocuments();

    console.log(`📊 Data Summary:`);
    console.log(`   Samples: ${sampleCount}`);
    console.log(`   Packing Slips: ${packingSlipCount}`);
    console.log(`   Total Records: ${sampleCount + packingSlipCount}`);

    // Show sample merchants
    if (sampleCount > 0) {
      const merchants = await AtlasSample.distinct('merchant');
      console.log(`\n🏢 Unique Merchants (${merchants.length}):`);
      merchants.slice(0, 10).forEach((merchant, index) => {
        console.log(`   ${index + 1}. ${merchant}`);
      });
      if (merchants.length > 10) {
        console.log(`   ... and ${merchants.length - 10} more`);
      }
    }

    // Show packing slip receivers
    if (packingSlipCount > 0) {
      const receivers = await AtlasPackingSlip.distinct('receiverName');
      console.log(`\n📦 Unique Receivers (${receivers.length}):`);
      receivers.forEach((receiver, index) => {
        console.log(`   ${index + 1}. ${receiver}`);
      });
    }

    // Test a sample query
    if (sampleCount > 0) {
      console.log(`\n🔍 Sample Query Test:`);
      const recentSamples = await AtlasSample.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('merchant designNo pieces createdAt');

      recentSamples.forEach((sample, index) => {
        console.log(`   ${index + 1}. ${sample.merchant} - ${sample.designNo} (${sample.pieces} pieces)`);
      });
    }

    await atlasConnection.close();

    console.log('\n✅ Atlas verification completed successfully!');
    console.log('🚀 Your data is ready for production use');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyAtlasData();
