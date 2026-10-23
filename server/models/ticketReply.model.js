const mongoose = require("mongoose");
const ticketReplySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    authorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10000,
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    replyType: {
      type: String,
      enum: ["reply", "internal_note"],
      default: "reply",
    },
  },
  { timestamps: true }
);

ticketReplySchema.pre("validate", function validateReplyType(next) {
  if (this.isInternal) this.replyType = "internal_note";
  if (this.replyType === "internal_note") this.isInternal = true;
  next();
});

ticketReplySchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.models.TicketReply || mongoose.model("TicketReply", ticketReplySchema);