const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(path, options = {}) {

  const token = localStorage.getItem("bookleaf_token");
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  console.log('data from api requset', response)

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  console.log('data from api requset', data)

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }
  return data;
}

const jsonBody = (body) => JSON.stringify(body);


export const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const PRIORITIES = ["Critical", "High", "Medium", "Low"];

export async function loginApi({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: jsonBody({ email, password }),
  });
}

export async function getBooksByAuthor() {
  return apiRequest("/books");
}

export async function getAllBooks() {
  return apiRequest("/books");
}

export async function getTicketsByAuthor(authorId) {
  return apiRequest(`/tickets/${encodeURIComponent(authorId)}`);
}

export async function getAllTickets() {
  return apiRequest("/tickets");
}

export async function getTicketById(ticketId) {
  return apiRequest(`/tickets/id/${encodeURIComponent(ticketId)}`);
}

export async function submitTicket(payload) {
  return apiRequest("/tickets", {
    method: "POST",
    body: jsonBody(payload),
  });
}

export async function sendAdminResponse({ ticketId, message }) {
  return apiRequest(`/tickets/${encodeURIComponent(ticketId)}/messages`, {
    method: "POST",
    body: jsonBody({ message }),
  });
}

export async function updateTicket(ticketId, updates) {
  return apiRequest(`/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PATCH",
    body: jsonBody(updates),
  });
}

export async function addInternalNote({ ticketId, message }) {
  return apiRequest(`/tickets/${encodeURIComponent(ticketId)}/notes`, {
    method: "POST",
    body: jsonBody({ message }),
  });
}
export async function generateAiDraft(ticketId) {
  return apiRequest(`/tickets/${encodeURIComponent(ticketId)}/ai-draft`, {
    method: "POST",
  });
}
