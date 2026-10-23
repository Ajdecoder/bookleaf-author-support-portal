const { Book, Royalty } = require("../models");

const getRoyaltySummary = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const bookFilter = isAdmin ? {} : { author: req.user.id };

    const books = await Book.find(bookFilter).select("_id title status");
    const bookIds = books.map((book) => book._id);

    const royaltyFilter = isAdmin ? {} : { author: req.user.id };

    const records = await Royalty.find(royaltyFilter);

    const summary = records.reduce(
      (result, item) => {
        result.copiesSold += item.copiesSold || 0;
        result.totalEarned += item.totalEarned || 0;
        result.paidAmount += item.paidAmount || 0;
        result.pendingAmount += item.pendingAmount || 0;
        return result;
      },
      { copiesSold: 0, totalEarned: 0, paidAmount: 0, pendingAmount: 0 }
    );

    return res.json({ summary, books });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch royalty summary" });
  }
};

module.exports = { getRoyaltySummary };