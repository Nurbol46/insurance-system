const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    policyNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'pending', 'expired', 'rejected'],
      default: 'pending',
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
