const pool = require('./config/db');

async function testQuery() {
    try {
        console.log('--- Participants ---');
        const participants = await pool.query('SELECT firstname, team_id FROM participant_profiles');
        console.table(participants.rows);

        console.log('--- Events ---');
        const events = await pool.query('SELECT event_id, title FROM events');
        console.table(events.rows);

        console.log('--- Teams ---');
        const teams = await pool.query('SELECT team_id, name FROM teams');
        console.table(teams.rows);

        console.log('--- Mapping Event Teams ---');
        const mapping = await pool.query('SELECT event_id, team_id FROM mapping_event_teams');
        console.table(mapping.rows);

        process.exit(0);
    } catch (err) {
        console.error('Error fetching data:', err.message);
        process.exit(1);
    }
}

testQuery();
