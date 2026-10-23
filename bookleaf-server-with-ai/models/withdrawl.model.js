const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1000, "Minimum payout threshold is ₹1000"],
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "paid",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    payoutMethod: {
      type: String,
      enum: ["bank_transfer"],
      default: "bank_transfer",
    },

    royaltyPeriodStart: {
      type: Date,
      default: null,
    },

    royaltyPeriodEnd: {
      type: Date,
      default: null,
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    processedAt: {
      type: Date,
      default: null,
    },

    transactionReference: {
      type: String,
      trim: true,
      default: null,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Withdrawal ||
  mongoose.model("Withdrawal", withdrawalSchema);