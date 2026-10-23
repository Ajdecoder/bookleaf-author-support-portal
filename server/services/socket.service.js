const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Ticket } = require("../models");

let io = null;

function sanitizeTicketForAuthor(ticket) {
  const obj = ticket.toObject ? ticket.toObject() : { ...ticket };
  delete obj.internalNotes;
  delete obj.aiErrorCode;
  return obj;
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        process.env.CORS_URL,
      ].filter(Boolean),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
  });

  // Authentication Middleware: Verify token from handshake auth or headers
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization
          ? socket.handshake.headers.authorization.split(" ")[1]
          : null);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error("Server authentication is not configured"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return next(new Error("Invalid token payload"));
      }

      // Verify against database - never trust client claims
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error("Invalid or inactive user"));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
        authorId: user.authorId || null,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role, authorId } = socket.user;

    // Join user's individual room
    socket.join(`user:${id}`);

    // Admins join the admin room
    if (role === "admin") {
      socket.join("admin");
    }

    // Authors join their author-specific room
    if (role === "author" && authorId) {
      socket.join(`author:${authorId}`);
    }

    // Join a specific ticket room (with strict authorization check)
    socket.on("join_ticket", async (ticketId, callback) => {
      try {
        if (!ticketId) {
          return callback && callback({ error: "Ticket ID is required" });
        }

        const filter = mongoose.Types.ObjectId.isValid(ticketId)
          ? { $or: [{ _id: ticketId }, { id: ticketId }] }
          : { id: ticketId };

        const ticket = await Ticket.findOne(filter);
        if (!ticket) {
          return callback && callback({ error: "Ticket not found" });
        }

        // Check permission:
        // Admin can join any ticket room.
        // Author can ONLY join rooms for tickets they own.
        const isOwner =
          (authorId && ticket.authorId === authorId) ||
          ticket.authorId === id;

        if (role !== "admin" && !isOwner) {
          return callback && callback({ error: "Access denied" });
        }

        const roomKey = `ticket:${ticket._id.toString()}`;
        socket.join(roomKey);

        if (ticket.id && ticket.id !== ticket._id.toString()) {
          socket.join(`ticket:${ticket.id}`);
        }

        if (callback) {
          callback({ success: true, roomId: roomKey });
        }
      } catch (err) {
        console.error("join_ticket error:", err);
        if (callback) callback({ error: "Failed to join ticket room" });
      }
    });

    // Leave a specific ticket room
    socket.on("leave_ticket", (ticketId) => {
      if (!ticketId) return;
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on("disconnect", () => {
      // Sockets leave rooms automatically on disconnect
    });
  });

  return io;
}

function getIO() {
  return io;
}

/**
 * Emit a new conversation message to ticket room and notify lists
 */
function emitNewMessage(ticket, message) {
  if (!io) return;
  const ticketIdStr = ticket._id.toString();
  const payload = {
    ticketId: ticketIdStr,
    message,
    status: ticket.status,
    lastReplyAt: ticket.lastReplyAt,
  };

  io.to(`ticket:${ticketIdStr}`).emit("new_message", payload);
  if (ticket.id && ticket.id !== ticketIdStr) {
    io.to(`ticket:${ticket.id}`).emit("new_message", payload);
  }

  // Update lists in real time
  io.to("admin").emit("ticket_list_updated", {
    ticketId: ticketIdStr,
    ticket: ticket.toObject ? ticket.toObject() : ticket,
  });

  if (ticket.authorId) {
    io.to(`author:${ticket.authorId}`).emit("ticket_list_updated", {
      ticketId: ticketIdStr,
      ticket: sanitizeTicketForAuthor(ticket),
    });
  }
}

/**
 * Emit ticket field updates (status, priority, category, assignee)
 */
function emitTicketUpdate(ticket) {
  if (!io) return;
  const ticketIdStr = ticket._id.toString();

  io.to(`ticket:${ticketIdStr}`).emit("ticket_updated", {
    ticketId: ticketIdStr,
    ticket: sanitizeTicketForAuthor(ticket),
  });

  if (ticket.id && ticket.id !== ticketIdStr) {
    io.to(`ticket:${ticket.id}`).emit("ticket_updated", {
      ticketId: ticketIdStr,
      ticket: sanitizeTicketForAuthor(ticket),
    });
  }

  // Notify admin queue with full ticket
  io.to("admin").emit("ticket_list_updated", {
    ticketId: ticketIdStr,
    ticket: ticket.toObject ? ticket.toObject() : ticket,
  });

  // Notify author list with sanitized ticket
  if (ticket.authorId) {
    io.to(`author:${ticket.authorId}`).emit("ticket_list_updated", {
      ticketId: ticketIdStr,
      ticket: sanitizeTicketForAuthor(ticket),
    });
  }
}

/**
 * Emit new ticket creation event
 */
function emitNewTicket(ticket) {
  if (!io) return;
  const fullTicket = ticket.toObject ? ticket.toObject() : ticket;

  io.to("admin").emit("new_ticket", { ticket: fullTicket });

  if (ticket.authorId) {
    io.to(`author:${ticket.authorId}`).emit("new_ticket", {
      ticket: sanitizeTicketForAuthor(ticket),
    });
  }
}

/**
 * Emit internal note added - ADMINS ONLY
 */
function emitInternalNote(ticket, note) {
  if (!io) return;
  const ticketIdStr = ticket._id.toString();

  // Broadcast ONLY to admins, never to authors
  io.to("admin").emit("internal_note_added", {
    ticketId: ticketIdStr,
    note,
  });
}

module.exports = {
  initSocket,
  getIO,
  emitNewMessage,
  emitTicketUpdate,
  emitNewTicket,
  emitInternalNote,
  sanitizeTicketForAuthor,
};
