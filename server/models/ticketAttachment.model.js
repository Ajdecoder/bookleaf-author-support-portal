const mongoose = require("mongoose");
const ticketAttachmentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    storageKey: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024,
    },
  },
  { timestamps: true }
);

ticketAttachmentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.models.TicketAttachment ||
  mongoose.model("TicketAttachment", ticketAttachmentSchema);