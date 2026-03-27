const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// ดึงข้อมูล Dashboard ของนิสิต
router.get('/dashboard', participantController.getParticipantDashboardData);

// ดึงรายละเอียดโครงการที่นิสิตเข้าร่วม (แยกตาม ID)
router.get('/projects/:id', participantController.getProjectDetail);

// ดึงรายการผู้เข้าร่วมทั้งหมด
router.get('/', participantController.getParticipants);

// ดึง Lookup data
router.get('/faculties', participantController.getFaculties);
router.get('/majors', participantController.getMajors);

// สร้างผู้เข้าร่วมใหม่
router.post('/', participantController.createParticipant);

module.exports = router;
