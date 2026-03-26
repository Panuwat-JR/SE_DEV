const pool = require('./config/db');
const dashboardController = require('./controllers/dashboardController');

// Mock req/res
const req = {};
const res = {
    json: (data) => {
        console.log('API SUCCESS:', JSON.stringify(data, null, 2));
        process.exit(0);
    },
    status: (code) => ({
        json: (err) => {
            console.error(`API ERROR (${code}):`, JSON.stringify(err, null, 2));
            process.exit(1);
        }
    })
};

console.log('Testing getParticipantDashboardData...');
dashboardController.getParticipantDashboardData(req, res);
