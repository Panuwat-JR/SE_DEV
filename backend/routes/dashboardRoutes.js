// ไฟล์: routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// เฉพาะเส้นทางของผู้บริหาร (GET /api/dashboard-data)
// พอร์ทัลผู้เข้าร่วมใช้ GET /api/participants-data/dashboard แทน — อย่าลงทะเบียนซ้ำที่นี่
router.get('/', dashboardController.getDashboardData);

module.exports = router;