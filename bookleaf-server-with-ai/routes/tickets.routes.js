
const express = require("express");

const {
  createTicket,
  getAllTickets,
  getTicketDetails,
  getTicketByAuthorId,
  updateTicket,
  getTicketById,
  getRecentTickets,
  generateAiDraft,
  addMessage,
} = require("../controllers/tickets.controller");

const router = express.Router();

// Assumes authentication middleware is applied before these routes.
// If not, add your authenticate middleware to this router.

router.get("/", getAllTickets);

// Keep specific routes before /:id
router.get("/author/:authorId", getTicketByAuthorId);

router.post("/", createTicket);
router.post("/:id/ai-draft", generateAiDraft);
router.post("/:id/messages", addMessage);
router.patch("/:id", updateTicket);
router.get("/:id", getTicketDetails);
router.get("/id/:ticketId", getTicketById);
router.get("recent", getRecentTickets)

module.exports = router;
