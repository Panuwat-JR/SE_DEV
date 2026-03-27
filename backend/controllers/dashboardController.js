const dashboardService = require('../services/dashboardService');

exports.getDashboardData = async (req, res) => {
  try {
    const [stats, upcomingActivities, recentTasks, activityLogs] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getUpcomingActivities(),
      dashboardService.getRecentTasks(),
      dashboardService.getActivityLogs(12),
    ]);

    res.json({
      stats,
      upcomingActivities,
      recentTasks,
      activityLogs,
    });
  } catch (err) {
    console.error('Dashboard Controller Error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

