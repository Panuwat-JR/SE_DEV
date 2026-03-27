const pool = require('./backend/config/db');
const dashboardController = require('./backend/controllers/dashboardController');

// Mock pool.query to see what's happening
/*
const originalQuery = pool.query;
pool.query = (...args) => {
  console.log('QUERY:', args[0].replace(/\s+/g, ' '));
  return originalQuery.apply(pool, args);
};
*/

async function test() {
  const req = {};
  const res = {
    status: (code) => {
      console.log(`Response Status: ${code}`);
      return {
        json: (data) => console.log(`Response JSON:`, JSON.stringify(data, null, 2))
      };
    },
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2))
  };

  try {
    console.log('Starting test...');
    await dashboardController.getParticipantDashboardData(req, res);
    console.log('Test completed.');
  } catch (err) {
    console.error('Caught Error in Test Logic:', err);
  } finally {
    await pool.end();
  }
}

test();
