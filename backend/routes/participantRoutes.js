const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// ดึงข้อมูล Dashboard ของนิสิต
router.get('/dashboard', participantController.getParticipantDashboardData);

// ดึงรายละเอียดโครงการที่นิสิตเข้าร่วม (แยกตาม ID)
router.get('/projects/:id', participantController.getProjectDetail);

module.exports = router;
