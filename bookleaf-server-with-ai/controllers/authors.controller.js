const { authors, withdrawals } = require("../data/seed");
const {
  getAuthorById,
  getAuthorEarnings,
  getAuthorBalance,
  getBookEarnings
} = require("../services/calculations");
const { parsePositiveInteger } = require("../utils/validation");

function getAllAuthors(req, res) {
  const result = authors.map((author) => ({
    id: author.id,
    name: author.name,
    email: author.email,
    totalEarnings: getAuthorEarnings(author),
    balance: getAuthorBalance(author)
  }));

  res.json({ data: result });
}

function getAuthorDetails(req, res) {
  const authorId = parsePositiveInteger(req.params.id);
  if (!authorId) return res.status(400).json({ error: "Author id must be a positive integer" });

  const author = getAuthorById(authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });

  const books = author.books.map((book) => ({
    ...book,
    ...getBookEarnings(book)
  }));

  res.json({
    data: {
      id: author.id,
      name: author.name,
      email: author.email,
      books,
      totalEarnings: getAuthorEarnings(author),
      totalWithdrawals: withdrawals
        .filter((item) => item.author_id === author.id && item.status !== "rejected")
        .reduce((sum, item) => sum + item.amount, 0),
      balance: getAuthorBalance(author)
    }
  });
}

function getAuthorSales(req, res) {
  const authorId = parsePositiveInteger(req.params.id);
  if (!authorId) return res.status(400).json({ error: "Author id must be a positive integer" });

  const author = getAuthorById(authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });

  const sales = author.books.flatMap((book) =>
    book.sales.map((sale) => ({
      ...sale,
      bookId: book.id,
      bookTitle: book.title,
      isbn: book.isbn,
      royaltyPerCopy: book.royaltyPerCopy,
      royaltyEarned: sale.copiesSold * book.royaltyPerCopy
    }))
  );

  res.json({ data: sales });
}

function getAuthorWithdrawals(req, res) {
  const authorId = parsePositiveInteger(req.params.id);
  if (!authorId) return res.status(400).json({ error: "Author id must be a positive integer" });

  const author = getAuthorById(authorId);
  if (!author) return res.status(404).json({ error: "Author not found" });

  res.json({
    data: withdrawals.filter((item) => item.author_id === authorId)
  });
}

module.exports = {
  getAllAuthors,
  getAuthorDetails,
  getAuthorSales,
  getAuthorWithdrawals
};
