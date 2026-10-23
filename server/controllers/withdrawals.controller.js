const { authors, withdrawals } = require("../data/seed");
const { getAuthorById, getAuthorBalance } = require("../services/calculations");
const { isValidWithdrawalAmount } = require("../utils/validation");

function createWithdrawal(req, res) {
  const { author_id, amount } = req.body || {};

  if (!Number.isInteger(author_id) || author_id <= 0) {
    return res.status(400).json({ error: "author_id must be a positive integer" });
  }

  if (!isValidWithdrawalAmount(amount)) {
    return res.status(400).json({ error: "amount must be a number greater than or equal to ₹500" });
  }

  const author = getAuthorById(author_id);
  if (!author) return res.status(404).json({ error: "Author not found" });

  const availableBalance = getAuthorBalance(author);
  if (amount > availableBalance) {
    return res.status(400).json({
      error: "Insufficient balance",
      availableBalance
    });
  }

  const withdrawal = {
    id: withdrawals.length ? Math.max(...withdrawals.map((item) => item.id)) + 1 : 1,
    author_id,
    amount,
    status: "pending",
    requestedAt: new Date().toISOString()
  };

  withdrawals.push(withdrawal);

  res.status(201).json({
    message: "Withdrawal request created",
    data: withdrawal,
    remainingBalance: getAuthorBalance(author)
  });
}

module.exports = { createWithdrawal };
