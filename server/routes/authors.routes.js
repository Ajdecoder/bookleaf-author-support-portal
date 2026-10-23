const express = require("express");
const {
  getAllAuthors,
  getAuthorDetails,
  getAuthorSales,
  getAuthorWithdrawals
} = require("../controllers/authors.controller");

const router = express.Router();

router.get("/", getAllAuthors);
router.get("/:id/sales", getAuthorSales);
router.get("/:id/withdrawals", getAuthorWithdrawals);
router.get("/:id", getAuthorDetails);

module.exports = router;
