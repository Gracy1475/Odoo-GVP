const express = require("express");
const driverController = require("../controllers/driverController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize([Roles.MANAGER, Roles.SAFETY_OFFICER, Roles.DISPATCHER]),
  asyncHandler(driverController.getDrivers),
);

router.get(
  "/compliance-summary",
  authorize([Roles.MANAGER, Roles.SAFETY_OFFICER]),
  asyncHandler(driverController.getComplianceSummary),
);

module.exports = router;