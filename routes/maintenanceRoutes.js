const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.get('/', maintenanceController.getMaintenanceLogs);
router.post('/', maintenanceController.createMaintenanceEntry);
router.patch('/:id/complete', maintenanceController.completeMaintenance);

module.exports = router;
