// ไฟล์: controllers/employeeController.js
const employeeService = require('../services/employeeService');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getEmployees();
    res.json(employees);
  } catch (err) {
    console.error('Employee Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const data = await employeeService.getDashboardData();
    res.json(data);
  } catch (err) {
    console.error('Employee Dashboard Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
