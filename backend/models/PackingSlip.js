const mongoose = require('mongoose');

const PackingSlipSchema = new mongoose.Schema({
  receiverName: { 
    type: String, 
    required: true 
  },
  brokerName: { 
    type: String 
  },
  packingSlipNumber: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  items: [
    {
      srNo: Number,
      merchant: String,
      productionSampleType: String,
      designNo: String,
      totalPieces: Number
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('PackingSlip', PackingSlipSchema);
