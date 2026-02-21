const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/events', authenticateToken, safetyController.getSafetyEvents);
router.get('/leaderboard', authenticateToken, safetyController.getSafetyLeaderboard);
router.post('/events', authenticateToken, safetyController.logSafetyEvent);

module.exports = router;
