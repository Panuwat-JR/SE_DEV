const pool = require('./config/db');
const dashboardController = require('./controllers/dashboardController');

// Mock req/res
const req = {
    params: { id: '1' }
};
const res = {
    json: (data) => {
        console.log('Project Detail API SUCCESS:', JSON.stringify(data, null, 2));
        process.exit(0);
    },
    status: (code) => {
        console.log(`HTTP Status: ${code}`);
        return {
            json: (err) => {
                console.error(`API ERROR (${code}):`, JSON.stringify(err, null, 2));
                process.exit(1);
            }
        };
    }
};

console.log('Testing getParticipantProjectDetail for ID 1...');
dashboardController.getParticipantProjectDetail(req, res);
