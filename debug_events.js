const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Events (Projects) ---');
        const eResult = await pool.query('SELECT event_id, title FROM events');
        console.table(eResult.rows);
        console.log('Total events in DB:', eResult.rowCount);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
