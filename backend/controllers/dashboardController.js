const dashboardService = require('../services/dashboardService');
const participantService = require('../services/participantService');

function parseDDMMYYYYToDate(s) {
  const m = String(s ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clampInt(n, min, max) {
  const x = Math.round(Number(n) || 0);
  return Math.max(min, Math.min(max, x));
}

function computeBlendedProgress({ done, total, start_date, end_date }) {
  const totalN = parseInt(total, 10) || 0;
  const doneN = parseInt(done, 10) || 0;
  const taskProgress = totalN > 0 ? (doneN / totalN) : 0;

  const start = parseDDMMYYYYToDate(start_date);
  let end = parseDDMMYYYYToDate(end_date);
  const now = Date.now();
  let timeProgress = 0;
  // ถ้า DB ไม่มีวันสิ้นสุด ให้ประมาณเป็น +90 วันจากวันเริ่ม (สำหรับ demo)
  if (start && !end) {
    end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
  }

  if (start && end && end.getTime() > start.getTime()) {
    if (now <= start.getTime()) timeProgress = 0;
    else if (now >= end.getTime()) timeProgress = 1;
    else timeProgress = (now - start.getTime()) / (end.getTime() - start.getTime());
  }

  // ให้ % ต่างกันอย่างสมเหตุสมผล: งาน 70% + เวลา 30%
  return clampInt((taskProgress * 0.7 + timeProgress * 0.3) * 100, 0, 100);
}

function statusBaselineProgress(statusSlug) {
  switch (String(statusSlug || '')) {
    case 'planning': return 10;
    case 'open_registration': return 15;
    case 'closed_registration': return 20;
    case 'announced': return 25;
    case 'in_progress': return 35;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 15;
  }
}

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
      const blended = computeBlendedProgress({
        done,
        total,
        start_date: proj.start_date,
        end_date: proj.end_date
      });
      const baseline = statusBaselineProgress(proj.statusSlug);
      // ทำให้ % แตกต่างกันตามสถานะ แม้ task จะเหมือนกัน (สำหรับ demo)
      const progress = clampInt(blended + (baseline - 15), 0, 100);

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