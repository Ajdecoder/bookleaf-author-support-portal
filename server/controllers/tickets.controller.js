
  const mongoose = require("mongoose");
  const { Ticket, Book, User } = require("../models");
  const { analyzeAndSaveTicket } = require("../services/aiTicket.service");

  const CATEGORIES = [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry",
  ];

  const PRIORITIES = ["Critical", "High", "Medium", "Low"];
  const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

  // Create ticket
  const createTicket = async (req, res) => {
    try {
      const { subject, description, bookId } = req.body;

      if (!subject || !description) {
        return res.status(400).json({
          message: "Subject and description are required",
        });
      }

      const ticket = await Ticket.create({
        ...req.body,
        authorId: req.user.authorId,
        bookId: bookId || null,
        status: "Open",
        category: req.body.category || "General Inquiry",
        priority: "Medium",
        aiStatus: "pending",
      });

      res.status(201).json({
        message: "Ticket created successfully",
        ticket,
      });

      // Run AI after responding so provider downtime never blocks ticket submission.
      analyzeAndSaveTicket(ticket._id).catch((error) => {
        console.error("Ticket AI analysis failed:", error.code || error.message);
      });
    } catch (error) {
      console.error("createTicket:", error);
      res.status(500).json({
        message: "Failed to create ticket",
      });
    }
  };

  // Get tickets: authors see their own, admins see all
  const getAllTickets = async (req, res) => {

    console.log('getall ticker called')
    try {

      const filter =
        req.user.role === "admin"
          ? {}
          : { authorId: req.user.authorId || req.user.id };

      const tickets = await Ticket.find(filter)

      return res.status(200).json({ tickets });
    } catch (error) {
      console.error("getAllTickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  };


  //     console.log("MY BOOKS USER:", req.user);

  //     const books = await Book.find({ authorId: req.user.id });
  //     console.log("BOOKS MATCHED BY USER ID:", books.length);

  //     return res.json(books);
  //   } catch (error) {
  //     console.error("getMyBooks:", error);
  //     return res.status(500).json({
  //       message: "Failed to fetch your books",
  //     });
  //   }

  // Get tickets for one author (admin only)
  const getTicketByAuthorId = async (req, res) => {



    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { authorId } = req.params;

      const tickets = await Ticket.findOne({ authorId })

      res.status(200).json({ tickets });
    } catch (error) {
      console.error("getTicketByAuthorId:", error);
      res.status(500).json({ message: "Failed to fetch author tickets" });
    }
  };

  const getTicketById = async (req, res) => {
    try {
      const { ticketId } = req.params;

      console.log('ksfjsldfj', ticketId)

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json({ ticket });
    } catch (error) {
      console.error("getTicketById:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  };

  // Get one ticket
  const getTicketDetails = async (req, res) => {
    try {

      console.log(req.params.ticketId, 'data from getTicketDetails')

      const ticket = await Ticket.findOne({ _id: req.params.ticketId });

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Author sirf apna ticket dekh sakta hai.
      if (
        req.user.role !== "admin" &&
        ticket.authorId !== req.user.id
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json({ ticket });
    } catch (error) {
      console.error("getTicketDetails:", error);
      return res.status(500).json({
        message: "Failed to fetch ticket details",
      });
    }
  };

  // Update ticket (admin only)
  const updateTicket = async (req, res) => {

    console.log('update controller hit hua')
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, category, priority, assignedTo } = req.body;
      const updates = {};

      if (status !== undefined) {
        if (!STATUSES.includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        updates.status = status;
        updates.resolvedAt = ["Resolved", "Closed"].includes(status)
          ? new Date()
          : null;
      }

      if (category !== undefined) {
        if (!CATEGORIES.includes(category)) {
          return res.status(400).json({ message: "Invalid category" });
        }

        updates.category = category;
      }

      if (priority !== undefined) {
        if (!PRIORITIES.includes(priority)) {
          return res.status(400).json({ message: "Invalid priority" });
        }

        updates.priority = priority;
      }

      if (assignedTo !== undefined) {
        if (assignedTo !== null) {
          const admin = await User.findOne({
            _id: assignedTo,
            role: "admin",
            isActive: true,
          });

          if (!admin) {
            return res.status(400).json({
              message: "Invalid admin assignee",
            });
          }
        }

        updates.assignedTo = assignedTo;
      }

      if (!Object.keys(updates).length) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const ticket = await Ticket.findOneAndUpdate(
        req.params.ticketId,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate("author", "name email")
        .populate("book", "title isbn")
        .populate("assignedTo", "name email");

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.status(200).json({
        message: "Ticket updated successfully",
        ticket,
      });
    } catch (error) {
      console.error("updateTicket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  };


  const generateAiDraft = async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const updatedTicket = await analyzeAndSaveTicket(ticket._id);
      return res.status(200).json({
        message: "AI analysis completed",
        ticket: updatedTicket,
      });
    } catch (error) {
      console.error("generateAiDraft:", error.code || error.message);
      const status = error.code === "AI_NOT_CONFIGURED" ? 503 : 502;
      return res.status(status).json({
        message: error.code === "AI_NOT_CONFIGURED"
          ? "AI is not configured. Add GROQ_API_KEY to the server .env file."
          : "AI analysis failed. Check the server configuration and try again.",
        code: error.code || "AI_ANALYSIS_FAILED",
      });
    }
  };



  const addMessage = async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const user = req.user;

      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          message: "Message is required",
        });
      }

      if (!user || !["author", "admin"].includes(user.role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      const ticket = await Ticket.findOne({
        $or: [{ _id: id }, { id }],
      });

      if (!ticket) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      // Authors can reply only to their own tickets.
      if (
        user.role === "author" &&
        ticket.authorId !== user.authorId
      ) {
        return res.status(403).json({
          message: "You cannot reply to this ticket",
        });
      }

      // Fetch the logged-in user's actual account details.
      const account = await User.findById(user.id);

      if (!account) {
        return res.status(404).json({
          message: "User account not found",
        });
      }

      const senderName =
        user.role === "admin"
          ? "BookLeaf Support"
          : account.name;

      if (!senderName) {
        return res.status(400).json({
          message: "Sender name is missing",
        });
      }

      // Repair legacy messages that lack required senderName.
      ticket.messages.forEach((existingMessage) => {
        if (!existingMessage.senderName?.trim()) {
          existingMessage.senderName =
            existingMessage.sender === "admin"
              ? "BookLeaf Support"
              : "Author";
        }
      });

      ticket.messages.push({
        id: crypto.randomUUID(),
        sender: user.role,
        senderName,
        message: message.trim(),
        createdAt: new Date(),
      });

      ticket.lastReplyAt = new Date();

      if (user.role === "author" && ticket.status === "Resolved") {
        ticket.status = "In Progress";
      }

      await ticket.save();

      return res.status(201).json({
        message: "Message sent successfully",
        ticket,
      });
    } catch (error) {
      console.error("Add message error:", error);

      return res.status(500).json({
        message: "Failed to send message",
      });
    }
  };

  const getRecentTickets = async (req, res) => {
    try {
      const tickets = await Ticket.find()
        .sort({ createdAt: -1 })
        .limit(3);

      res.status(200).json({ tickets });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  };

  module.exports = {
    createTicket,
    getAllTickets,
    getTicketDetails,
    getTicketByAuthorId,
    updateTicket,
    getTicketById,
    getRecentTickets,
    generateAiDraft,
    addMessage
  };
