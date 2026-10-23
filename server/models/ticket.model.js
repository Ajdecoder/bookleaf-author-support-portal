const mongoose = require("mongoose");
const TICKET_CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const ticketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    authorId: {
      type: String,
      trim: true,
      index: true,
    },
    bookId: {
      type: String,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: TICKET_CATEGORIES,
      default: "General Inquiry",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    assignedTo: {
      type: String,
      ref: "User",
      default: null,
      index: true,
    },
    internalNotes: [
      {
        id: { type: String, trim: true },
        author: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true, maxlength: 10000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    messages: [
      {
        id: { type: String, trim: true },
        sender: { type: String, enum: ["author", "admin"], required: true },
        senderName: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true, maxlength: 10000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    aiCategory: {
      type: String,
      enum: [...TICKET_CATEGORIES, null],
      default: null,
    },
    aiPriority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", null],
      default: null,
    },
    aiDraftReply: {
      type: String,
      default: "",
      maxlength: 10000,
    },
    aiStatus: {
      type: String,
      enum: ["not_started", "pending", "completed", "failed"],
      default: "not_started",
      index: true,
    },
    aiErrorCode: {
      type: String,
      default: null,
      select: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    lastReplyAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, priority: 1, createdAt: 1 });
ticketSchema.index({ authorId: 1, createdAt: -1 });

ticketSchema.statics.categories = TICKET_CATEGORIES;

module.exports = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);