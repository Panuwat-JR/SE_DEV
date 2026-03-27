const dashboardService = require('./backend/services/dashboardService');
const feedbackService = require('./backend/services/feedbackService');

async function runTest() {
  try {
    console.log('Testing Dashboard Stats...');
    const stats = await dashboardService.getStats();
    console.log('Dashboard Stats SUCCESS:', stats);

    console.log('Testing Feedback Stats...');
    const fStats = await feedbackService.getFeedbackStats();
    console.log('Feedback Stats SUCCESS:', fStats);

    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();
