const express = require("express");
const { createWithdrawal } = require("../controllers/withdrawals.controller");

const router = express.Router();

router.post("/", createWithdrawal);

module.exports = router;
