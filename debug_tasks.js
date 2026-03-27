const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Priority Levels ---');
        const pResult = await pool.query('SELECT * FROM priority_levels');
        console.table(pResult.rows);

        console.log('\n--- Task Categories ---');
        const cResult = await pool.query('SELECT * FROM task_categories');
        console.table(cResult.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
