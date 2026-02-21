const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/summary",
  authorize([Roles.MANAGER, Roles.FINANCIAL_ANALYST]),
  asyncHandler(analyticsController.getSummary),
);

router.get(
  "/fleet-health",
  authorize([Roles.MANAGER, Roles.FINANCIAL_ANALYST]),
  asyncHandler(analyticsController.getFleetHealth),
);

module.exports = router;