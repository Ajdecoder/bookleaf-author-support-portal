const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];

async function analyzeTicket(ticket) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error("GROQ_API_KEY is not configured");
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a careful support triage assistant for a book publisher. Return ONLY JSON with keys category, priority, draftReply. category must be exactly one of: ${CATEGORIES.join(" | ")}. priority must be exactly one of: ${PRIORITIES.join(" | ")}. Write a polite, concise draft reply to the author. Do not claim a payment was made, a book shipped, a deadline exists, or an issue was fixed unless the ticket provides that fact. If details are missing, say the team will check and ask for relevant details. Do not make decisions or send the reply.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            subject: ticket.subject,
            description: ticket.description,
            bookId: ticket.bookId || null,
          }),
        },
      ],
    }),
  });

const payload = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error("Groq API error:", {
    status: response.status,
    message: payload.error?.message,
    type: payload.error?.type,
    code: payload.error?.code,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
  });

  const error = new Error(
    payload.error?.message ||
    `AI provider request failed (${response.status})`
  );

  error.code = "AI_PROVIDER_ERROR";
  throw error;
}

  const content = payload.choices?.[0]?.message?.content;
  let result;
  try {
    result = JSON.parse(content);
  } catch {
    const error = new Error("AI provider returned invalid JSON");
    error.code = "AI_INVALID_RESPONSE";
    throw error;
  }

  if (!CATEGORIES.includes(result.category) || !PRIORITIES.includes(result.priority) ||
      typeof result.draftReply !== "string" || !result.draftReply.trim()) {
    const error = new Error("AI response did not match the required ticket format");
    error.code = "AI_INVALID_RESPONSE";
    throw error;
  }

  return {
    aiCategory: result.category,
    aiPriority: result.priority,
    aiDraftReply: result.draftReply.trim().slice(0, 10000),
  };
}

async function analyzeAndSaveTicket(ticketId) {
  const { Ticket } = require("../models");
  await Ticket.findByIdAndUpdate(ticketId, { aiStatus: "pending", aiErrorCode: null });
  try {
    const ticket = await Ticket.findById(ticketId).select("subject description bookId");
    if (!ticket) return null;
    const result = await analyzeTicket(ticket);
    return await Ticket.findByIdAndUpdate(ticketId, {
      ...result,
      aiStatus: "completed",
      aiErrorCode: null,
    }, { new: true });
  } catch (error) {
    await Ticket.findByIdAndUpdate(ticketId, {
      aiStatus: "failed",
      aiErrorCode: error.code || "AI_ANALYSIS_FAILED",
    });
    throw error;
  }
}

module.exports = { analyzeTicket, analyzeAndSaveTicket };
