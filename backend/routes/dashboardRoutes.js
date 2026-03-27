// ไฟล์: routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// เฉพาะเส้นทางของผู้บริหาร
router.get('/', dashboardController.getDashboardData);

// เส้นทางสำหรับ Participant (หน้า /participant/dashboard, /participant/projects)
router.get('/participant-data', dashboardController.getParticipantDashboardData);


module.exports = router;