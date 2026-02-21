const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Dashboard is protected as it contains financial/fleet sensitive data
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

module.exports = router;
