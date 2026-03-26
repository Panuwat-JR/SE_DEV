// ไฟล์: routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboardData);
router.get('/participant-data', dashboardController.getParticipantDashboardData);
router.get('/project-detail/:id', dashboardController.getParticipantProjectDetail);

module.exports = router;