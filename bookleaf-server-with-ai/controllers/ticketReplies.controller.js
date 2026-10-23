const mongoose = require("mongoose");
const { Ticket, TicketReply } = require("../models");

const getReplies = async (req, res) => {
  try {
    const ticket = await Ticket.findOne(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && String(ticket.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = { ticket: ticket._id };

    // Never expose internal notes to authors.
    if (!isAdmin) filter.isInternal = false;

    const replies = await TicketReply.find(filter)
      .populate("authorUser", "name role")
      .sort({ createdAt: 1 });

    return res.json({ replies });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    return res.status(500).json({ message: "Failed to fetch replies" });
  }
};

const addReply = async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (message.trim().length > 10000) {
      return res.status(400).json({ message: "Message is too long" });
    }

    const ticket = await Ticket.findOne(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isAdmin = req.user.role === "admin";

    if (!isAdmin && String(ticket.author) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (isInternal && !isAdmin) {
      return res.status(403).json({ message: "Only admins can add internal notes" });
    }

    if (["Resolved", "Closed"].includes(ticket.status)) {
      return res.status(409).json({
        message: "This ticket is closed; reopen it before replying",
      });
    }

    const reply = await TicketReply.create({
      ticket: ticket._id,
      authorUser: req.user.id,
      message: message.trim(),
      isInternal: isAdmin && Boolean(isInternal),
      replyType: isAdmin && isInternal ? "internal_note" : "reply",
    });

    ticket.lastReplyAt = reply.createdAt;
    await ticket.save();

    return res.status(201).json({ message: "Reply added", reply });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }
    return res.status(500).json({ message: "Failed to add reply" });
  }
};

module.exports = { getReplies, addReply };