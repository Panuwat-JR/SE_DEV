// ไฟล์: routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// เมื่อหน้าเว็บเรียก API มาที่ /api/teams ให้ไปดึงข้อมูลจาก Controller
router.get('/', teamController.getTeamsData);

module.exports = router;