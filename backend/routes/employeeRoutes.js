// ไฟล์: routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET /api/employees/dashboard — ต้องอยู่ก่อน /:id
router.get('/dashboard', employeeController.getDashboard);

// GET /api/employees — รายชื่อพนักงานทั้งหมด
router.get('/', employeeController.getEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
