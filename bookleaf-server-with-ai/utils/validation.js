function parsePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidWithdrawalAmount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 500;
}

module.exports = { parsePositiveInteger, isValidWithdrawalAmount };
