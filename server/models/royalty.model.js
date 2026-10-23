const mongoose = require("mongoose");
const royaltySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    periodStart: {
      type: Date,
      default: null,
    },
    periodEnd: {
      type: Date,
      default: null,
    },
    copiesSold: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    payoutStatus: {
      type: String,
      enum: ["not_due", "pending", "eligible", "partially_paid", "paid"],
      default: "pending",
      index: true,
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

royaltySchema.pre("validate", function validateAmounts(next) {
  if (this.paidAmount > this.totalEarned) {
    this.invalidate("paidAmount", "Paid amount cannot exceed total earned");
  }
  this.pendingAmount = Math.max(0, this.totalEarned - this.paidAmount);
  next();
});

royaltySchema.index({ author: 1, book: 1, periodStart: 1, periodEnd: 1 }, { unique: true });

module.exports = mongoose.models.Royalty || mongoose.model("Royalty", royaltySchema);