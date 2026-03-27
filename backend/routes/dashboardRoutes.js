// ไฟล์: routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// เฉพาะเส้นทางของผู้บริหาร
router.get('/', dashboardController.getDashboardData);

module.exports = router;