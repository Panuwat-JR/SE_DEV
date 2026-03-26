const dashboardService = require('../services/dashboardService');

exports.getDashboardData = async (req, res) => {
  try {
    const [stats, upcomingActivities, recentTasks] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getUpcomingActivities(),
      dashboardService.getRecentTasks(),
    ]);

    res.json({
      stats,
      upcomingActivities,
      recentTasks,
      activityLogs: [] // Can be added later as a service method
    });
  } catch (err) {
    console.error('Dashboard Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};