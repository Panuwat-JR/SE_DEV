const participantService = require('../services/participantService');

exports.getParticipantDashboardData = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    
    // 1. Get raw projects
    const projects = await participantService.getProjectList(participantName);

    // 2. Enrich with task stats
    const enrichedProjects = await Promise.all(projects.map(async (proj) => {
      const tasksSummary = await participantService.getTaskSummary(proj.id);
      const nextTask = await participantService.getNextTask(proj.id);

      const total = parseInt(tasksSummary.total) || 0;
      const done = parseInt(tasksSummary.done) || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        ...proj,
        progress,
        doneItems: done,
        totalItems: total,
        nextTask: nextTask?.task_name || '—',
        nextDeadline: nextTask?.deadline || '—'
      };
    }));

    res.json(enrichedProjects);
  } catch (err) {
    console.error('Participant Dashboard Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const participantName = 'ปิยะ';

    const project = await participantService.getProjectDetail(id, participantName);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await participantService.getAllTasks(id);

    // Simulated Timeline
    const timeline = [
      { phase: 'เปิดรับสมัคร', start: '1 ม.ค. 2569', end: project.start_date, done: true },
      { phase: 'รอดำเนินการ', start: project.start_date, end: project.end_date, done: false, current: true },
      { phase: 'ประกาศผล', start: project.end_date, end: project.end_date, done: false },
    ];

    res.json({ ...project, tasks, timeline });
  } catch (err) {
    console.error('Project Detail Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
