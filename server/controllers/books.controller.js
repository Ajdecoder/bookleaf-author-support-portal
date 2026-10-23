const { Book } = require("../models");

const getAllBooks = async (req, res) => {
  try {
    // Admin can see all books; authors can see only their own.
    const filter =
      req.user.role === "admin"
        ? {}
        : { authorId: req.user.authorId || req.user.id };

    const books = await Book.find(filter);
    return res.status(200).json(books);
  } catch (error) {
    console.error("getAllBooks:", error);
    return res.status(500).json({
      message: "Failed to fetch books",
    });
  }
};

const getBookDetails = async (req, res) => {
  console.log('getbookdetails data',req.user.authorId)
  try {
    const book = await Book.find({ authorId: req.user.authorId });

    if (!book) {  
      return res.status(404).json({ message: "Book not found" });
    }

    // Authors must not access another author's book.
    if (
      req.user.role !== "admin" &&
      String(book.authorId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("getBookDetails:", error);
    return res.status(500).json({
      message: "Failed to fetch book details",
    });
  }
};

const getMyBooks = async (req, res) => {
  try {
    console.log("MY BOOKS USER:", req.user);
    
    const books = await Book.find();
    console.log("BOOKS MATCHED BY USER ID:", books.length);

    return res.json(books);
  } catch (error) {
    console.error("getMyBooks:", error);
    return res.status(500).json({
      message: "Failed to fetch your books",
    });
  }
};

module.exports = { getAllBooks, getBookDetails, getMyBooks };