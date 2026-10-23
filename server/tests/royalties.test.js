const { getRoyaltySummary, requestWithdrawal, getWithdrawals } = require("../controllers/royalty.controller");
const royaltyRoutes = require("../routes/royalty.routes");
const { Book, Withdrawal } = require("../models");

jest.mock("../models", () => ({
  Book: {
    find: jest.fn(),
  },
  Withdrawal: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

const mockUser = {
  id: "650000000000000000000001",
  authorId: "AUTH001",
  role: "author",
};

const mockBooks = [
  {
    _id: "book-1",
    title: "Whispers of the Ganges",
    authorRoyaltyPerCopy: 35,
    totalCopiesSold: 342,
    totalRoyaltyEarned: 11970,
    royaltyPaid: 8400,
    royaltyPending: 3570,
  },
  {
    _id: "book-2",
    title: "The Saffron Diaries",
    authorRoyaltyPerCopy: 42,
    totalCopiesSold: 189,
    totalRoyaltyEarned: 7938,
    royaltyPaid: 7938,
    royaltyPending: 0,
  },
];

describe("Royalty Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRoyaltySummary", () => {
    test("calculates royalties and available balance correctly with no withdrawals", async () => {
      Book.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBooks),
      });
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const req = { user: mockUser };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getRoyaltySummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];

      expect(data.summary.totalCopiesSold).toBe(531);
      expect(data.summary.totalRoyaltyEarned).toBe(19908);
      expect(data.summary.royaltyPaid).toBe(16338);
      expect(data.summary.royaltyPending).toBe(3570);
      expect(data.summary.pendingWithdrawals).toBe(0);
      expect(data.summary.availableBalance).toBe(3570);
      expect(data.books).toHaveLength(2);
      expect(data.withdrawals).toHaveLength(0);
    });

    test("deducts in-flight pending withdrawals from available balance without double-counting", async () => {
      Book.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBooks),
      });
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: "w-1", amount: 1000, status: "pending" },
          { _id: "w-2", amount: 500, status: "rejected" }, // Should not be deducted
        ]),
      });

      const req = { user: mockUser };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getRoyaltySummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];

      expect(data.summary.royaltyPending).toBe(3570);
      expect(data.summary.pendingWithdrawals).toBe(1000);
      expect(data.summary.availableBalance).toBe(2570); // 3570 - 1000
      expect(data.withdrawals).toHaveLength(2);
    });

    test("returns 401 if unauthenticated", async () => {
      const req = { user: null };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getRoyaltySummary(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authentication required",
      });
    });
  });

  describe("requestWithdrawal", () => {
    test("rejects request if amount is below minimum ₹1000", async () => {
      const req = {
        user: mockUser,
        body: { amount: 500 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await requestWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Minimum payout threshold is ₹1000",
      });
      expect(Withdrawal.create).not.toHaveBeenCalled();
    });

    test("rejects request if amount is missing or invalid", async () => {
      const req = {
        user: mockUser,
        body: { amount: "not-a-number" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await requestWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "A valid positive withdrawal amount is required",
      });
    });

    test("rejects request if amount exceeds available balance", async () => {
      Book.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBooks), // Pending: 3570
      });
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: "w-1", amount: 2000, status: "pending" }, // Available: 3570 - 2000 = 1570
        ]),
      });

      const req = {
        user: mockUser,
        body: { amount: 2000 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await requestWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      const data = res.json.mock.calls[0][0];
      expect(data.message).toContain("exceeds available balance");
      expect(data.availableBalance).toBe(1570);
      expect(Withdrawal.create).not.toHaveBeenCalled();
    });

    test("creates withdrawal successfully when valid and updates available balance", async () => {
      Book.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBooks), // Pending: 3570
      });
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]), // Available: 3570
      });
      Withdrawal.create.mockResolvedValue({
        _id: "w-new",
        author: mockUser.id,
        amount: 1500,
        status: "pending",
        payoutMethod: "bank_transfer",
      });

      const req = {
        user: mockUser,
        body: { amount: 1500 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await requestWithdrawal(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const data = res.json.mock.calls[0][0];
      expect(data.message).toBe("Withdrawal request submitted successfully");
      expect(data.withdrawal.amount).toBe(1500);
      expect(data.availableBalance).toBe(2070); // 3570 - 1500
      expect(Withdrawal.create).toHaveBeenCalledWith({
        author: mockUser.id,
        amount: 1500,
        status: "pending",
        payoutMethod: "bank_transfer",
      });
    });
  });

  describe("getWithdrawals", () => {
    test("returns withdrawal history for author", async () => {
      const mockList = [
        { _id: "w-1", amount: 1000, status: "pending" },
      ];
      Withdrawal.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockList),
      });

      const req = { user: mockUser };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getWithdrawals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ withdrawals: mockList });
    });
  });

  describe("Royalty Routes Mapping", () => {
    test("routes file exposes GET /summary, POST /withdraw, and GET /withdrawals", () => {
      const routes = royaltyRoutes.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      expect(routes).toEqual(
        expect.arrayContaining([
          { path: "/summary", methods: ["get"] },
          { path: "/withdraw", methods: ["post"] },
          { path: "/withdrawals", methods: ["get"] },
        ])
      );
    });
  });
});
