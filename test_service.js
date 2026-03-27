const dashboardService = require('./backend/services/dashboardService');

async function test() {
  try {
    const tasks = await dashboardService.getRecentTasks();
    console.log('Recent Tasks:', JSON.stringify(tasks, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

test();
