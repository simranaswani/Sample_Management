import mongoose from 'mongoose';

const SampleSchema = new mongoose.Schema({
  merchant: { type: String, required: true },
  productionSampleType: { type: String, required: true },
  designNo: { type: String, required: true },
  pieces: { type: Number, required: true },
  dateCreated: { type: Date, default: Date.now },
  qrCodeId: { type: String, unique: true },
  batchHistory: [{
    pieces: Number,
    dateCreated: Date,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Sample || mongoose.model('Sample', SampleSchema);
