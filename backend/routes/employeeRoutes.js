// ไฟล์: routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET /api/employees — รายชื่อพนักงานทั้งหมด
router.get('/', employeeController.getEmployees);

// GET /api/employees/dashboard — ข้อมูล E_Dashboard
router.get('/dashboard', employeeController.getDashboard);

module.exports = router;
