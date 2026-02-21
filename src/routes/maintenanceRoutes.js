const express = require("express");
const maintenanceController = require("../controllers/maintenanceController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize([Roles.MANAGER, Roles.SAFETY_OFFICER]),
  asyncHandler(maintenanceController.getMaintenanceLogs),
);

router.post(
  "/",
  authorize([Roles.MANAGER, Roles.SAFETY_OFFICER]),
  asyncHandler(maintenanceController.createMaintenanceLog),
);

module.exports = router;