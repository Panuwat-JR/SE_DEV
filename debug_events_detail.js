const pool = require('./backend/config/db');

async function check() {
    try {
        console.log('--- Full Event Details ---');
        const eResult = await pool.query(`
            SELECT 
                e.event_id, 
                e.title, 
                se.name as status, 
                se.slug as status_slug 
            FROM events e
            LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
        `);
        console.table(eResult.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
