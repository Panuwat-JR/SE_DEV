const pool = require('./backend/config/db');

async function check() {
    try {
        const name = 'ปิยะ';
        const id = 1;

        console.log('--- Checking Participant ---');
        const pResult = await pool.query('SELECT * FROM participant_profiles WHERE firstname = $1', [name]);
        console.log('Participant found:', pResult.rows.length);
        if (pResult.rows.length > 0) {
            console.log('Participant details:', pResult.rows[0]);
            const teamId = pResult.rows[0].team_id;

            console.log('\n--- Checking Team ---');
            const tResult = await pool.query('SELECT * FROM teams WHERE team_id = $1', [teamId]);
            console.log('Team name:', tResult.rows[0]?.name);

            console.log('\n--- Checking Event 1 ---');
            const eResult = await pool.query('SELECT * FROM events WHERE event_id = $1', [id]);
            console.log('Event found:', eResult.rows.length);
            if (eResult.rows.length > 0) {
                console.log('Event title:', eResult.rows[0].title);
            }

            console.log('\n--- Checking Mapping ---');
            const mResult = await pool.query('SELECT * FROM mapping_event_teams WHERE event_id = $1 AND team_id = $2', [id, teamId]);
            console.log('Mapping found:', mResult.rows.length);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
