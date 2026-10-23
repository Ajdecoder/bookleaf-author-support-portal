
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




router.get("/", getAllTickets);
router.get("/recent", getRecentTickets);


router.get("/author/:authorId", getTicketByAuthorId);
router.get("/id/:ticketId", getTicketById);

router.post("/", createTicket);
router.post("/:id/ai-draft", generateAiDraft);
router.post("/:id/messages", addMessage);
router.patch("/id/:ticketId", updateTicket);
router.patch("/:id", updateTicket);
router.get("/:id", getTicketDetails);

module.exports = router;
