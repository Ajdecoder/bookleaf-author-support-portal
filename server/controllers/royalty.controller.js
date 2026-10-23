const { Book, Withdrawal } = require("../models");

/**
 * Helper to compute author's royalty metrics, books, and withdrawal history
 */
const getAuthorRoyaltyData = async (user) => {
  const bookFilter = user.authorId
    ? { $or: [{ author: user.id }, { authorId: user.authorId }] }
    : { author: user.id };

  const books = await Book.find(bookFilter).sort({ createdAt: -1 });

  const summary = books.reduce(
    (acc, book) => {
      acc.totalCopiesSold += Number(book.totalCopiesSold) || 0;
      acc.totalRoyaltyEarned += Number(book.totalRoyaltyEarned) || 0;
      acc.royaltyPaid += Number(book.royaltyPaid) || 0;
      acc.royaltyPending += Number(book.royaltyPending) || 0;
      return acc;
    },
    {
      totalCopiesSold: 0,
      totalRoyaltyEarned: 0,
      royaltyPaid: 0,
      royaltyPending: 0,
    }
  );

  const withdrawals = await Withdrawal.find({ author: user.id }).sort({ createdAt: -1 });

  const PENDING_STATUSES = ["pending", "approved", "processing"];
  const pendingWithdrawalAmount = withdrawals
    .filter((w) => PENDING_STATUSES.includes(w.status))
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const paidWithdrawalAmount = withdrawals
    .filter((w) => w.status === "paid")
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const committedAmount = pendingWithdrawalAmount + paidWithdrawalAmount;
  const availableBalance = Math.max(0, summary.royaltyPending - committedAmount);

  return {
    books,
    withdrawals,
    summary: {
      totalCopiesSold: summary.totalCopiesSold,
      totalRoyaltyEarned: summary.totalRoyaltyEarned,
      royaltyPaid: summary.royaltyPaid,
      royaltyPending: summary.royaltyPending,
      pendingWithdrawals: pendingWithdrawalAmount,
      paidWithdrawals: paidWithdrawalAmount,
      availableBalance,
    },
  };
};

/**
 * GET /royalties/summary
 * Returns logged-in author's royalty metrics, book breakdown, and withdrawal history.
 */
const getRoyaltySummary = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { summary, books, withdrawals } = await getAuthorRoyaltyData(req.user);

    return res.status(200).json({
      summary,
      books,
      withdrawals,
    });
  } catch (error) {
    console.error("getRoyaltySummary error:", error);
    return res.status(500).json({ message: "Failed to fetch royalty summary" });
  }
};

/**
 * POST /royalties/withdraw
 * Submits a new withdrawal request for the logged-in author.
 */
const requestWithdrawal = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { amount, payoutMethod = "bank_transfer" } = req.body || {};

    const numericAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "A valid positive withdrawal amount is required" });
    }

    if (numericAmount < 1000) {
      return res.status(400).json({ message: "Minimum payout threshold is ₹1000" });
    }

    if (payoutMethod && payoutMethod !== "bank_transfer") {
      return res.status(400).json({ message: "Currently only bank_transfer payout method is supported" });
    }

    const { summary } = await getAuthorRoyaltyData(req.user);

    if (numericAmount > summary.availableBalance) {
      return res.status(400).json({
        message: `Requested amount (₹${numericAmount.toLocaleString("en-IN")}) exceeds available balance (₹${summary.availableBalance.toLocaleString("en-IN")})`,
        availableBalance: summary.availableBalance,
      });
    }

    const withdrawal = await Withdrawal.create({
      author: req.user.id,
      amount: numericAmount,
      status: "pending",
      payoutMethod: "bank_transfer",
    });

    const newAvailableBalance = Math.max(0, summary.availableBalance - numericAmount);

    return res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal,
      availableBalance: newAvailableBalance,
    });
  } catch (error) {
    console.error("requestWithdrawal error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to process withdrawal request" });
  }
};

/**
 * GET /royalties/withdrawals
 * Returns the logged-in author's withdrawal requests.
 */
const getWithdrawals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const withdrawals = await Withdrawal.find({ author: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ withdrawals });
  } catch (error) {
    console.error("getWithdrawals error:", error);
    return res.status(500).json({ message: "Failed to fetch withdrawal requests" });
  }
};

module.exports = {
  getRoyaltySummary,
  requestWithdrawal,
  getWithdrawals,
};
