const express = require("express");
const {
  getAllBooks,
  getBookDetails,
  getMyBooks,
} = require("../controllers/books.controller");

const router = express.Router();

router.get("/", getAllBooks);
router.get("/my-books", getMyBooks);
router.get("/:id", getBookDetails);
  
module.exports = router;