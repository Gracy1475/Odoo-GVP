const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.get('/', driverController.getDrivers);
router.post('/', driverController.addDriver);
router.patch('/:id/status', driverController.updateDriverStatus);

module.exports = router;
