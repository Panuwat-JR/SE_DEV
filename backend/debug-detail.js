const pool = require('./config/db');
const participantService = require('./services/participantService');

async function debug() {
    try {
        const id = '1';
        const name = 'ปิยะ';
        console.log(`Searching for Project ID: ${id}, Participant: ${name}`);
        
        const project = await participantService.getProjectDetail(id, name);
        if (!project) {
            console.log('Result: NOT FOUND (undefined)');
            
            // Check why it's not found
            const checkEvent = await pool.query('SELECT * FROM events WHERE event_id = $1', [id]);
            console.log('Event exists:', checkEvent.rows.length > 0);
            
            const checkParticipant = await pool.query('SELECT * FROM participant_profiles WHERE firstname = $1', [name]);
            console.log('Participant exists:', checkParticipant.rows.length > 0);
            
            if (checkParticipant.rows.length > 0) {
                const teamId = checkParticipant.rows[0].team_id;
                const checkMapping = await pool.query('SELECT * FROM mapping_event_teams WHERE event_id = $1 AND team_id = $2', [id, teamId]);
                console.log('Mapping exists for this team:', checkMapping.rows.length > 0);
            }
        } else {
            console.log('Result: FOUND', project);
        }
        process.exit(0);
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        process.exit(1);
    }
}

debug();
