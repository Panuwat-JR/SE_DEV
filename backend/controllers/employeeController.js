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
    const data = await employeeService.getDashboardData(req.query.employee_id);
    res.json(data);
  } catch (err) {
    console.error('Employee Dashboard Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const items = await employeeService.getStaffCalendar(req.query.employee_id);
    res.json(items);
  } catch (err) {
    console.error('Employee calendar:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const row = await employeeService.createEmployee(req.body || {});
    res.status(201).json(row);
  } catch (err) {
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ error: err.message });
    }
    console.error('createEmployee:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const row = await employeeService.updateEmployee(req.params.id, req.body || {});
    if (!row) return res.status(404).json({ error: 'ไม่พบพนักงาน' });
    res.json(row);
  } catch (err) {
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ error: err.message });
    }
    console.error('updateEmployee:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const ok = await employeeService.deleteEmployee(req.params.id);
    if (!ok) return res.status(404).json({ error: 'ไม่พบพนักงาน' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteEmployee:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
