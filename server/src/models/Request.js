const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchantName: { type: String, required: true, trim: true, maxlength: 150 },
    merchantUPI: { type: String, required: true, trim: true, maxlength: 150 },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR', maxlength: 10 },
    transactionRef: { type: String, trim: true, maxlength: 100, default: '' },
    transactionNote: { type: String, trim: true, maxlength: 200, default: '' },
    merchantCode: { type: String, trim: true, maxlength: 50, default: '' },
    rawQR: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid', 'expired'],
      default: 'pending',
      index: true,
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

requestSchema.index({ createdAt: -1 });
requestSchema.index({ requester: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
