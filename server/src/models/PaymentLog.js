const mongoose = require('mongoose');

// Append-only audit trail of every status transition on a request.
const paymentLogSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fromStatus: { type: String, required: true },
    toStatus: { type: String, required: true },
    note: { type: String, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentLog', paymentLogSchema);
