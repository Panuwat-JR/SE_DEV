// ไฟล์: controllers/dashboardController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
const pool = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    const teamsCount = await pool.query('SELECT COUNT(*) FROM teams');
    const tasksCount = await pool.query('SELECT COUNT(*) FROM tasks');
    const pendingTasksCount = await pool.query(`
      SELECT COUNT(*) FROM tasks t
      JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      WHERE ts.slug = 'pending' OR ts.name = 'รอดำเนินการ'
    `);
    const docsCount = await pool.query('SELECT COUNT(*) FROM documents');

    const stats = {
      total_activities: parseInt(eventsCount.rows[0].count),
      registered_teams: parseInt(teamsCount.rows[0].count),
      total_tasks: parseInt(tasksCount.rows[0].count),
      pending_tasks: parseInt(pendingTasksCount.rows[0].count),
      total_documents: parseInt(docsCount.rows[0].count),
      documents_this_month: parseInt(docsCount.rows[0].count),
      active_activities: 0
    };

    const activitiesResult = await pool.query(`
      SELECT
        e.event_id AS id,
        e.title,
        COALESCE(s.name, 'เปิดรับสมัคร') AS status,
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
        0 AS current_participants,
        COALESCE(e.max_team_member, 100) AS max_participants,
        COALESCE(CAST(e.prize_pool AS TEXT), 'ยังไม่ระบุ') AS prize_pool
      FROM events e
      LEFT JOIN status_events s ON e.status_event_id = s.status_event_id
      ORDER BY e.event_id DESC
    `);

    const tasksResult = await pool.query(`
      SELECT
        t.task_id AS id,
        t.task_name AS title,
        COALESCE(e.title, 'ไม่ระบุกิจกรรม') AS project_name,
        COALESCE(pl.name, 'ปกติ') AS priority,
        CASE
          WHEN ts.name = 'เสร็จสิ้น' THEN 100
          WHEN ts.name = 'กำลังทำ' OR ts.name = 'กำลังดำเนินการ' THEN 50
          ELSE 0
        END AS progress_percent
      FROM tasks t
      LEFT JOIN events e ON t.event_id = e.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      ORDER BY t.task_id DESC LIMIT 3
    `);

    const logsResult = await pool.query(`
      SELECT
        'evt_' || event_id AS id,
        'event' AS action_type,
        'สร้างกิจกรรมใหม่' AS title,
        title AS description,
        'สมชาย สมศรี' AS user_name,
        create_at AS created_at
      FROM events
      ORDER BY create_at DESC LIMIT 5
    `);

    const formatTimeAgo = (date) => {
      if (!date) return 'เมื่อสักครู่';
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + ' วันที่แล้ว';
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + ' ชั่วโมงที่แล้ว';
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + ' นาทีที่แล้ว';
      return 'เมื่อสักครู่';
    };

    const formattedLogs = logsResult.rows.map(log => ({ ...log, time_ago: formatTimeAgo(log.created_at) }));

    res.json({
      stats,
      upcomingActivities: activitiesResult.rows,
      recentTasks: tasksResult.rows,
      projectTimelines: [],
      activityLogs: formattedLogs
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};