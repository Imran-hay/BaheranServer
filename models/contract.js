var mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    renter: {
        type: String,
        required: true, // Renter's value (e.g., name or ID)
    },
    contractId: {
        type: String,
        required: false, // Unique ID for the renter
  
    },

    phone: {
      type: String,
      required: true,
     
  },
    contractLength: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    mode: {
        type: String,
        required: true,
    },
    totalSize:{
        type: Number,
        required: false,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Draft','Expired','Terminated','Pending Activation'],
        default: 'Pending',
        required: true,
    },
    payments: [
        {
            lastpaid: {
                type: Date,
                required: false,
            },
            duedate: {
                type: Date,
                required: false,
            },
            amount: {
                type: Number,
                required: false,
            },
            TransactionId: {
                type: String,
                required: false,
            },
        },
    ],
    writtenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        default: null,
    },
    roomNumbers: {
        type: [String], 
        required: true,
        default: [],
    },

    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building', 
      required: true,
      default: null,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract', 
    required: false,
    default: null,

  }
});





module.exports = mongoose.models.Contract || mongoose.model("Contract", contractSchema);