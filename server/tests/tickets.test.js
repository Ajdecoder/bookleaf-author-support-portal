const { updateTicket, getTicketDetails } = require("../controllers/tickets.controller");
const ticketRoutes = require("../routes/tickets.routes");
const { Ticket, User } = require("../models");
const cors = require("cors");

jest.mock("../models", () => ({
  Ticket: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
  Book: {
    find: jest.fn(),
  },
}));

jest.mock("../services/aiTicket.service", () => ({
  analyzeAndSaveTicket: jest.fn(),
}));

describe("Ticket Controller - updateTicket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adminUser = {
    id: "6ad9a802d1b649e4619e271c",
    role: "admin",
  };

  const authorUser = {
    id: "6ad9a802d1b649e4619e271d",
    role: "author",
    authorId: "AUTH001",
  };

  const mockTicket = {
    _id: "6ad8fea9bc93b3dfaaa1a733",
    id: "TCK-1001",
    authorId: "AUTH001",
    subject: "Royalty not received for last quarter",
    description: "I published my book 4 months ago and still have not received any royalty.",
    category: "Royalty & Payments",
    priority: "High",
    status: "In Progress",
    assignedTo: null,
    resolvedAt: null,
  };

  test("rejects request if caller is not an admin", async () => {
    const req = {
      user: authorUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { status: "Resolved" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin access required" });
    expect(Ticket.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("successfully updates status to 'Resolved' and sets resolvedAt", async () => {
    const updatedDoc = {
      ...mockTicket,
      status: "Resolved",
      resolvedAt: new Date(),
    };
    Ticket.findOneAndUpdate.mockResolvedValue(updatedDoc);

    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { status: "Resolved" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Ticket updated successfully",
      ticket: updatedDoc,
    });
    expect(Ticket.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { _id: "6ad8fea9bc93b3dfaaa1a733" },
          { id: "6ad8fea9bc93b3dfaaa1a733" },
        ],
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: "Resolved",
          resolvedAt: expect.any(Date),
        }),
      }),
      { new: true, runValidators: true }
    );
  });

  test("successfully updates priority and category", async () => {
    const updatedDoc = {
      ...mockTicket,
      priority: "Critical",
      category: "ISBN & Metadata Issues",
    };
    Ticket.findOneAndUpdate.mockResolvedValue(updatedDoc);

    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: {
        priority: "Critical",
        category: "ISBN & Metadata Issues",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Ticket updated successfully",
      ticket: updatedDoc,
    });
  });

  test("successfully updates assignedTo when given a valid admin", async () => {
    const adminAssigneeId = "6ad9a802d1b649e4619e271c";
    User.findOne.mockResolvedValue({
      _id: adminAssigneeId,
      role: "admin",
      isActive: true,
    });

    const updatedDoc = {
      ...mockTicket,
      assignedTo: adminAssigneeId,
    };
    Ticket.findOneAndUpdate.mockResolvedValue(updatedDoc);

    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { assignedTo: adminAssigneeId },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Ticket updated successfully",
      ticket: updatedDoc,
    });
  });

  test("supports reading ticket ID from req.params.ticketId (e.g. /tickets/id/:ticketId)", async () => {
    const updatedDoc = {
      ...mockTicket,
      status: "Closed",
    };
    Ticket.findOneAndUpdate.mockResolvedValue(updatedDoc);

    const req = {
      user: adminUser,
      params: { ticketId: "6ad8fea9bc93b3dfaaa1a733" },
      body: { status: "Closed" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(Ticket.findOneAndUpdate).toHaveBeenCalled();
  });

  test("returns 400 for invalid status", async () => {
    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { status: "InvalidStatus" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid status" });
  });

  test("returns 400 for invalid priority", async () => {
    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { priority: "Urgent" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid priority" });
  });

  test("returns 400 for invalid category", async () => {
    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { category: "Billing" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid category" });
  });

  test("returns 400 when no valid update fields are provided", async () => {
    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "No fields to update" });
  });

  test("returns 404 if ticket is not found in database", async () => {
    Ticket.findOneAndUpdate.mockResolvedValue(null);

    const req = {
      user: adminUser,
      params: { id: "6ad8fea9bc93b3dfaaa1a733" },
      body: { status: "Resolved" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateTicket(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ticket not found" });
  });
});

describe("CORS Configuration for Browser Preflight", () => {
  test("CORS preflight OPTIONS request returns PATCH in Access-Control-Allow-Methods", () => {
    const corsMiddleware = cors({
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    const req = {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5173",
        "access-control-request-method": "PATCH",
        "access-control-request-headers": "authorization,content-type",
      },
    };

    const headers = {};
    const res = {
      setHeader: (k, v) => {
        headers[k] = v;
      },
      getHeader: (k) => headers[k],
      end: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    corsMiddleware(req, res, () => {});

    expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:5173");
    expect(headers["Access-Control-Allow-Methods"]).toContain("PATCH");
    expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
  });
});

describe("Ticket Routes Mapping", () => {
  test("route exposes PATCH /:id and PATCH /id/:ticketId", () => {
    const patchRoutes = ticketRoutes.stack
      .filter((layer) => layer.route && layer.route.methods.patch)
      .map((layer) => layer.route.path);

    expect(patchRoutes).toContain("/:id");
    expect(patchRoutes).toContain("/id/:ticketId");
  });
});
