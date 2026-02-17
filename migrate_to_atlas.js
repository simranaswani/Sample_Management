const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/sample_management';

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

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from local MongoDB to Atlas...\n');

    // Connect to local database
    console.log('📡 Connecting to local MongoDB...');
    const localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI);
    const LocalSample = localConnection.model('Sample', SampleSchema);
    const LocalPackingSlip = localConnection.model('PackingSlip', PackingSlipSchema);

    // Connect to Atlas database
    console.log('☁️  Connecting to MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI);
    const AtlasSample = atlasConnection.model('Sample', SampleSchema);
    const AtlasPackingSlip = atlasConnection.model('PackingSlip', PackingSlipSchema);

    // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data in Atlas...');
    await AtlasSample.deleteMany({});
    await AtlasPackingSlip.deleteMany({});

    // Migrate Samples
    console.log('📦 Migrating samples...');
    const samples = await LocalSample.find({});
    console.log(`   Found ${samples.length} samples in local database`);

    if (samples.length > 0) {
      await AtlasSample.insertMany(samples);
      console.log(`   ✅ Successfully migrated ${samples.length} samples to Atlas`);
    } else {
      console.log('   ℹ️  No samples found to migrate');
    }

    // Migrate Packing Slips
    console.log('📋 Migrating packing slips...');
    const packingSlips = await LocalPackingSlip.find({});
    console.log(`   Found ${packingSlips.length} packing slips in local database`);

    if (packingSlips.length > 0) {
      await AtlasPackingSlip.insertMany(packingSlips);
      console.log(`   ✅ Successfully migrated ${packingSlips.length} packing slips to Atlas`);
    } else {
      console.log('   ℹ️  No packing slips found to migrate');
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const atlasSampleCount = await AtlasSample.countDocuments();
    const atlasPackingSlipCount = await AtlasPackingSlip.countDocuments();

    console.log(`   Samples in Atlas: ${atlasSampleCount}`);
    console.log(`   Packing Slips in Atlas: ${atlasPackingSlipCount}`);

    // Show sample data
    if (atlasSampleCount > 0) {
      console.log('\n📊 Sample data preview:');
      const samplePreview = await AtlasSample.find({}).limit(3).select('merchant designNo pieces dateCreated');
      samplePreview.forEach((sample, index) => {
        console.log(`   ${index + 1}. ${sample.merchant} - ${sample.designNo} (${sample.pieces} pieces) - ${sample.dateCreated}`);
      });
    }

    if (atlasPackingSlipCount > 0) {
      console.log('\n📋 Packing slip data preview:');
      const packingSlipPreview = await AtlasPackingSlip.find({}).limit(3).select('receiverName packingSlipNumber date items');
      packingSlipPreview.forEach((slip, index) => {
        console.log(`   ${index + 1}. ${slip.receiverName} - ${slip.packingSlipNumber} (${slip.items.length} items) - ${slip.date}`);
      });
    }

    // Close connections
    await localConnection.close();
    await atlasConnection.close();

    console.log('\n🎉 Migration completed successfully!');
    console.log('✨ Your data is now available in MongoDB Atlas');
    console.log('🔗 You can now deploy your Next.js app to Vercel with Atlas as the database');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
