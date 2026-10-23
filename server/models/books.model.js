const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    authorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    isbn: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    genre: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Unspecified",
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "in_production",
        "published",
        "on_hold",
        "cancelled",
        "Published & Live",
        "Printing",
        "In Production - Cover Design",
        "In Production - Typesetting",
      ],
      default: "draft",
      index: true,
    },
    mrp: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalCopiesSold: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRoyaltyEarned: {
      type: Number,
      min: 0,
      default: 0,
    },
    royaltyPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    royaltyPending: {
      type: Number,
      min: 0,
      default: 0,
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    authorRoyaltyPerCopy: {
      type: Number,
      min: 0,
      default: null,
    },
    lastRoyaltyPayoutDate: {
      type: Date,
      default: null,
    },
    printPartner: {
      type: String,
      trim: true,
      default: null,
    },
    availableOn: {
      type: [String],
      default: [],
    },

  },
  { timestamps: true }
);

bookSchema.index({ author: 1, status: 1 });

module.exports = mongoose.models.Book || mongoose.model("Book", bookSchema);