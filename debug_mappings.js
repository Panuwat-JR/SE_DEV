const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Event Mapping for Employees ---');
        const mResult = await pool.query('SELECT * FROM mapping_event_employees');
        console.table(mResult.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
