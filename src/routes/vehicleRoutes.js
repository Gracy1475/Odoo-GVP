const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize([Roles.MANAGER, Roles.DISPATCHER, Roles.SAFETY_OFFICER]),
  asyncHandler(vehicleController.getVehicles),
);

module.exports = router;