import mongoose from 'mongoose';

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

export default mongoose.models.PackingSlip || mongoose.model('PackingSlip', PackingSlipSchema);
