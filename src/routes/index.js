const express = require("express");
const authRoutes = require("./authRoutes");
const tripRoutes = require("./tripRoutes");
const driverRoutes = require("./driverRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const notificationRoutes = require("./notificationRoutes");
const vehicleRoutes = require("./vehicleRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/drivers", driverRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/vehicles", vehicleRoutes);

module.exports = router;