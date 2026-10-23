const { authors, withdrawals } = require("../data/seed");

function getAuthorById(authorId) {
  return authors.find((author) => author.id === Number(authorId)) || null;
}

function getAuthorEarnings(author) {
  return author.books.reduce((total, book) => {
    const copies = book.sales.reduce((sum, sale) => sum + sale.copiesSold, 0);
    return total + copies * book.royaltyPerCopy;
  }, 0);
}

function getAuthorBalance(author) {
  const earnings = getAuthorEarnings(author);
  const totalWithdrawals = withdrawals
    .filter((item) => item.author_id === author.id && item.status !== "rejected")
    .reduce((sum, item) => sum + item.amount, 0);

  return earnings - totalWithdrawals;
}

function getBookEarnings(book) {
  const copiesSold = book.sales.reduce((sum, sale) => sum + sale.copiesSold, 0);
  return {
    copiesSold,
    royaltyPerCopy: book.royaltyPerCopy,
    totalEarnings: copiesSold * book.royaltyPerCopy
  };
}

module.exports = {
  getAuthorById,
  getAuthorEarnings,
  getAuthorBalance,
  getBookEarnings
};
