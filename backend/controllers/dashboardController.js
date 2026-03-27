const dashboardService = require('../services/dashboardService');
const participantService = require('../services/participantService');

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
    console.error('Dashboard Controller Error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

exports.getParticipantDashboardData = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; 
    const projectList = await participantService.getProjectList(participantName);

    const enrichedProjects = await Promise.all(projectList.map(async (proj) => {
      const [summary, nextTask] = await Promise.all([
        participantService.getTaskSummary(proj.id),
        participantService.getNextTask(proj.id)
      ]);

      const total = parseInt(summary.total) || 0;
      const done = parseInt(summary.done) || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        ...proj,
        doneItems: done,
        totalItems: total,
        progress: progress,
        progressColor: progress >= 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300',
        nextTask: nextTask ? nextTask.task_name : '—',
        nextDeadline: nextTask ? nextTask.deadline : '—'
      };
    }));

    res.json(enrichedProjects);
  } catch (err) {
    console.error('Participant Dashboard Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getParticipantProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const participantName = 'ปิยะ';

    console.log(`[DEBUG] Participant Project Detail Request - ID: ${id}, Name: ${participantName}`);

    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      console.error(`[ERROR] Invalid project ID provided: ${id}`);
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const project = await participantService.getProjectDetail(projectId, participantName);
    
    if (!project) {
      console.warn(`[WARN] Project not found in DB for ID: ${projectId} and Name: ${participantName}`);
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await participantService.getAllTasks(projectId);

    // Timeline mock (can be enhanced if DB supports it)
    const timeline = [
      { phase: 'รับสมัคร', done: true, current: false, start: '01/03/2026', end: '15/03/2026' },
      { phase: 'ปฐมนิเทศ', done: true, current: false, start: '16/03/2026', end: '16/03/2026' },
      { phase: 'ช่วงดำเนินงาน', done: false, current: true, start: project.start_date, end: project.end_date },
      { phase: 'ปิดโครงการ', done: false, current: false, start: project.end_date, end: project.end_date }
    ];

    res.json({
      ...project,
      tasks,
      timeline
    });
  } catch (err) {
    console.error('Project Detail Error:', err.message);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};