const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/report', authenticateToken, analyticsController.getOperationalAnalytics);
router.get('/export/csv', authenticateToken, analyticsController.exportCSV);

module.exports = router;
