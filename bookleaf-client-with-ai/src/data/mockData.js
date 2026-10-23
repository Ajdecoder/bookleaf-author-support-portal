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

export const users = [
  {
    id: "author-1",
    name: "Anuj Kumar Shrivastav",
    email: "author@bookleaf.com",
    password: "author@123",
    role: "author",
  },
  {
    id: "admin-1",
    name: "BookLeaf Admin",
    email: "admin@bookleaf.com",
    password: "Admin@123",
    role: "admin",
  },
];

export const books = [
  {
    id: "book-1",
    authorId: "author-1",
    title: "The Delhi Diaries",
    isbn: "978-93-12345-01-2",
    genre: "Fiction",
    publicationDate: "2025-08-12",
    status: "Published & Live",
    mrp: 399,
    totalCopiesSold: 1240,
    totalRoyaltyEarned: 24800,
    royaltyPaid: 18000,
    royaltyPending: 6800,
  },
  {
    id: "book-2",
    authorId: "author-1",
    title: "Startup Lessons from India",
    isbn: "978-93-12345-02-9",
    genre: "Business",
    publicationDate: "2025-11-02",
    status: "Published & Live",
    mrp: 499,
    totalCopiesSold: 640,
    totalRoyaltyEarned: 14200,
    royaltyPaid: 9200,
    royaltyPending: 5000,
  },
  {
    id: "book-3",
    authorId: "author-1",
    title: "Poems of Monsoon",
    isbn: "978-93-12345-03-6",
    genre: "Poetry",
    publicationDate: "2026-09-18",
    status: "Printing",
    mrp: 249,
    totalCopiesSold: 0,
    totalRoyaltyEarned: 0,
    royaltyPaid: 0,
    royaltyPending: 0,
  },
];

let ticketId = 4;

export const tickets = [
  {
    id: "TCK-1001",
    authorId: "author-1",
    bookId: "book-1",
    subject: "Royalty not received for last quarter",
    description:
      "I published my book 4 months ago and still have not received any royalty. Please check my payout status.",
    category: "Royalty & Payments",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-18T10:30:00.000Z",
    updatedAt: "2026-10-20T14:10:00.000Z",
    assignedTo: "admin-1",
    internalNotes: [
      {
        id: "note-1",
        author: "BookLeaf Admin",
        message: "Verified sales data. Payout is scheduled for next cycle.",
        createdAt: "2026-10-20T14:00:00.000Z",
      },
    ],
    messages: [
      {
        id: "msg-1",
        sender: "author",
        senderName: "Anuj Kumar Shrivastav",
        message:
          "I published my book 4 months ago and still have not received any royalty. Please check my payout status.",
        createdAt: "2026-10-18T10:30:00.000Z",
      },
      {
        id: "msg-2",
        sender: "admin",
        senderName: "BookLeaf Support",
        message:
          "We understand your concern. Royalties are calculated quarterly and paid within 45 days after the quarter ends. Your current payout is scheduled for the next cycle. We are reviewing your account and will update you within 48 hours.",
        createdAt: "2026-10-20T14:10:00.000Z",
      },
    ],
  },
  {
    id: "TCK-1002",
    authorId: "author-1",
    bookId: "book-2",
    subject: "Book unavailable on Amazon",
    description:
      "My book is published but it is showing as Currently Unavailable on Amazon India.",
    category: "Distribution & Availability",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-10-20T09:15:00.000Z",
    updatedAt: "2026-10-20T09:15:00.000Z",
    assignedTo: null,
    internalNotes: [],
    messages: [
      {
        id: "msg-3",
        sender: "author",
        senderName: "Anuj Kumar Shrivastav",
        message:
          "My book is published but it is showing as Currently Unavailable on Amazon India.",
        createdAt: "2026-10-20T09:15:00.000Z",
      },
    ],
  },
  {
    id: "TCK-1003",
    authorId: "author-1",
    bookId: "book-3",
    subject: "Print quality issue in author copies",
    description:
      "I received my author copies and the images are blurry. Some pages are also misaligned.",
    category: "Printing & Quality",
    priority: "High",
    status: "Resolved",
    createdAt: "2026-10-12T16:45:00.000Z",
    updatedAt: "2026-10-15T11:20:00.000Z",
    assignedTo: "admin-1",
    internalNotes: [],
    messages: [
      {
        id: "msg-4",
        sender: "author",
        senderName: "Anuj Kumar Shrivastav",
        message:
          "I received my author copies and the images are blurry. Some pages are also misaligned.",
        createdAt: "2026-10-12T16:45:00.000Z",
      },
      {
        id: "msg-5",
        sender: "admin",
        senderName: "BookLeaf Support",
        message:
          "We are sorry about the printing quality. Please share photos of the defective copies. Once verified, we will arrange a free reprint, which usually takes 5–7 business days.",
        createdAt: "2026-10-15T11:20:00.000Z",
      },
    ],
  },
];

export function createTicket(payload) {
  const newTicket = {
    id: `TCK-${1000 + ticketId++}`,
    authorId: payload.authorId,
    bookId: payload.bookId,
    subject: payload.subject,
    description: payload.description,
    category: payload.category || "General Inquiry",
    priority: payload.priority || "Medium",
    status: "Open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
    internalNotes: [],
    messages: [
      {
        id: crypto.randomUUID(),
        sender: "author",
        senderName: payload.authorName,
        message: payload.description,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  tickets.unshift(newTicket);
  return newTicket;
}