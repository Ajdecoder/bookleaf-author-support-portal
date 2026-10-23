const express = require("express");
const {
  getRoyaltySummary,
  requestWithdrawal,
  getWithdrawals,
} = require("../controllers/royalty.controller");

const router = express.Router();

router.get("/summary", getRoyaltySummary);
router.post("/withdraw", requestWithdrawal);
router.get("/withdrawals", getWithdrawals);

module.exports = router;
