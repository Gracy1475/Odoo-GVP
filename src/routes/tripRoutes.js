const express = require("express");
const tripController = require("../controllers/tripController");
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/asyncHandler");
const { Roles } = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize([Roles.MANAGER, Roles.DISPATCHER, Roles.SAFETY_OFFICER]),
  asyncHandler(tripController.getTrips),
);

router.post(
  "/",
  authorize([Roles.MANAGER, Roles.DISPATCHER]),
  asyncHandler(tripController.createTrip),
);

router.patch(
  "/:id/status",
  authorize([Roles.MANAGER, Roles.DISPATCHER]),
  asyncHandler(tripController.updateTripStatus),
);

module.exports = router;