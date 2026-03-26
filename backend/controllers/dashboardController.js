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

exports.getParticipantDashboardData = async (req, res) => {
  try {
    // สำหรับเดโม ใช้ชื่อ 'ปิยะ' ตามที่เรา seed ไว้
    const participantName = 'ปิยะ';
    
    // 1. ดึงโครงการที่นิสิตเข้าร่วม
    const projectsResult = await pool.query(`
      SELECT 
        e.event_id AS id,
        e.title,
        COALESCE(se.name, 'กำลังดำเนินการ') AS status,
        CASE 
          WHEN se.slug = 'completed' THEN 'bg-gray-100 text-gray-600 border-gray-200'
          WHEN se.slug = 'in_progress' THEN 'bg-emerald-100 text-emerald-700 border-emerald-200'
          ELSE 'bg-blue-100 text-blue-700 border-blue-200'
        END AS "statusColor",
        CASE
          WHEN se.slug = 'completed' THEN 'bg-gray-400'
          WHEN se.slug = 'in_progress' THEN 'bg-emerald-500'
          ELSE 'bg-blue-500'
        END AS "progressColor",
        t.name AS team,
        'หัวหน้าทีม' AS role, -- หรือดึงจากตาราง if needed
        COALESCE(CAST(e.prize_pool AS TEXT) || ' บาท', 'ไม่ระบุ') AS prize
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE pp.firstname = $1
    `, [participantName]);

    // 2. ดึงงานและความคืบหน้าของแต่ละโครงการ
    const projectsWithTasks = await Promise.all(projectsResult.rows.map(async (proj) => {
      const tasksSummary = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE ts.slug = 'completed') as done
        FROM tasks
        LEFT JOIN task_statuses ts ON tasks.status_task_id = ts.status_task_id
        WHERE event_id = $1
      `, [proj.id]);

      const nextTaskResult = await pool.query(`
        SELECT task_name, TO_CHAR(due_date, 'DD/MM/YYYY') as deadline
        FROM tasks
        LEFT JOIN task_statuses ts ON tasks.status_task_id = ts.status_task_id
        WHERE event_id = $1 AND COALESCE(ts.slug, '') != 'completed'
        ORDER BY due_date ASC LIMIT 1
      `, [proj.id]);

      const total = parseInt(tasksSummary.rows[0].total) || 0;
      const done = parseInt(tasksSummary.rows[0].done) || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        ...proj,
        progress,
        doneItems: done,
        totalItems: total,
        nextTask: nextTaskResult.rows[0]?.task_name || '—',
        nextDeadline: nextTaskResult.rows[0]?.deadline || '—'
      };
    }));

    res.json(projectsWithTasks);
  } catch (err) {
    console.error('Participant Dashboard Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getParticipantProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const participantName = 'ปิยะ';

    // 1. ดึงข้อมูลพื้นฐานของโครงการและทีม
    const projectResult = await pool.query(`
      SELECT 
        e.event_id AS id,
        e.title,
        e.description,
        COALESCE(se.name, 'กำลังดำเนินการ') AS status,
        CASE 
          WHEN se.slug = 'completed' THEN 'bg-gray-100 text-gray-600 border-gray-200'
          WHEN se.slug = 'in_progress' THEN 'bg-emerald-100 text-emerald-700 border-emerald-200'
          ELSE 'bg-blue-100 text-blue-700 border-blue-200'
        END AS "statusColor",
        t.name AS team,
        COALESCE(CAST(e.prize_pool AS TEXT) || ' บาท', 'ไม่ระบุ') AS prize,
        COALESCE(e.max_team_member, 5) AS "maxParticipants",
        (SELECT COUNT(*) FROM participant_profiles WHERE team_id = t.team_id) AS "currentParticipants",
        TO_CHAR(e.event_start_date, 'DD/MM/YYYY') as start_date,
        TO_CHAR(e.event_end_date, 'DD/MM/YYYY') as end_date
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE e.event_id = $1 AND pp.firstname = $2
      LIMIT 1
    `, [id, participantName]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // 2. ดึงงานทั้งหมด
    const tasksResult = await pool.query(`
      SELECT 
        task_id AS id,
        task_name AS name,
        (SELECT slug FROM task_statuses WHERE status_task_id = tasks.status_task_id) = 'completed' AS done
      FROM tasks
      WHERE event_id = $1
      ORDER BY task_id ASC
    `, [id]);

    // 3. จำลอง Timeline (เนื่องจากไม่มีตาราง timeline แยก)
    const timeline = [
      { phase: 'เปิดรับสมัคร', start: '1 ม.ค. 2569', end: project.start_date, done: true },
      { phase: 'รอดำเนินการ', start: project.start_date, end: project.end_date, done: false, current: true },
      { phase: 'ประกาศผล', start: project.end_date, end: project.end_date, done: false },
    ];

    res.json({
      ...project,
      tasks: tasksResult.rows,
      timeline
    });
  } catch (err) {
    console.error('Project Detail Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};