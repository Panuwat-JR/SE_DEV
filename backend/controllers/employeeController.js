const pool = require('../config/db');

exports.getEmployees = async (req, res) => {
  try {
    const query = `
      SELECT
        e.employee_id AS id,
        ep.first_name,
        ep.last_name,
        COALESCE(er.name, 'พนักงาน') AS role,
        COALESCE(d.name, 'ส่วนกลาง') AS department,
        e.email,
        ep.gender,
        COALESCE(e.status, 'active') AS status,
        COALESCE(e.online_status, 'offline') AS online_status,
        SUBSTRING(ep.first_name FROM 1 FOR 1) AS initial,
        'bg-blue-500' AS color
      FROM employees e
      JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
      LEFT JOIN employee_roles er ON ep.role_employee_id = er.role_employee_id
      LEFT JOIN departments d ON ep.department_id = d.department_id
      ORDER BY e.employee_id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
