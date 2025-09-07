const mongoose = require('mongoose');

const SampleSchema = new mongoose.Schema({
  merchant: { 
    type: String, 
    required: true 
  },
  productionSampleType: { 
    type: String, 
    required: true 
  }, // A, B, C, etc.
  designNo: { 
    type: String, 
    required: true 
  },
  pieces: { 
    type: Number, 
    required: true 
  },
  dateCreated: { 
    type: Date, 
    default: Date.now 
  },
  qrCodeId: { 
    type: String, 
    unique: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sample', SampleSchema);

