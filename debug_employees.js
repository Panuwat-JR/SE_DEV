const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Employees ---');
        const eResult = await pool.query(`
            SELECT 
                e.employee_id, 
                ep.first_name, 
                ep.last_name, 
                er.name as role 
            FROM employees e
            JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
            JOIN employee_roles er ON ep.role_employee_id = er.role_employee_id
        `);
        console.table(eResult.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
