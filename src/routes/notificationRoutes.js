const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize([Roles.MANAGER, Roles.DISPATCHER, Roles.SAFETY_OFFICER, Roles.FINANCIAL_ANALYST]),
  asyncHandler(notificationController.getNotifications),
);

module.exports = router;