const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.get('/', tripController.getTrips);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.patch('/:id/complete', tripController.completeTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
