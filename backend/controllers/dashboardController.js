// ไฟล์: controllers/dashboardController.js
const pool = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const eventsCount = await pool.query('SELECT COUNT(*) FROM Event');
    const teamsCount = await pool.query('SELECT COUNT(*) FROM Team');
    const tasksCount = await pool.query('SELECT COUNT(*) FROM Task');
    const pendingTasksCount = await pool.query(`SELECT COUNT(*) FROM Task t JOIN Task_status ts ON t.task_status_id = ts.task_status_id WHERE ts.name = 'รอดำเนินการ'`);
    const docsCount = await pool.query(`SELECT COUNT(*) FROM Task t JOIN Task_category tc ON t.task_category_id = tc.task_category_id WHERE tc.name = 'เอกสาร'`);

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
      SELECT e.event_id AS id, e.event_name AS title, COALESCE(s.name, 'เปิดรับสมัคร') AS status, COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
      0 AS current_participants, 100 AS max_participants, COALESCE(e.prize_money, 'ยังไม่ระบุ') AS prize_money
      FROM Event e LEFT JOIN Status_event s ON e.status_event_id = s.status_event_id ORDER BY e.event_id DESC
    `);

    const tasksResult = await pool.query(`
      SELECT t.task_id AS id, t.title, COALESCE(e.event_name, 'ไม่ระบุกิจกรรม') AS project_name, COALESCE(pl.name, 'ปกติ') AS priority,
      CASE WHEN ts.name = 'เสร็จสิ้น' THEN 100 WHEN ts.name = 'กำลังทำ' THEN 50 ELSE 0 END AS progress_percent
      FROM Task t LEFT JOIN Event e ON t.event_id = e.event_id LEFT JOIN Task_status ts ON t.task_status_id = ts.task_status_id LEFT JOIN Priority_level pl ON t.priority_level_id = pl.priority_level_id ORDER BY t.task_id DESC LIMIT 3
    `);

    const logsResult = await pool.query(`
      SELECT 'evt_' || event_id AS id, 'event' AS action_type, 'สร้างกิจกรรมใหม่' AS title, event_name AS description, 'สมชาย สมศรี' AS user_name, created_at
      FROM Event ORDER BY created_at DESC LIMIT 5
    `);

    const formatTimeAgo = (date) => {
      if (!date) return "เมื่อสักครู่";
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " วันที่แล้ว";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " ชั่วโมงที่แล้ว";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " นาทีที่แล้ว";
      return "เมื่อสักครู่";
    };

    const formattedLogs = logsResult.rows.map(log => ({ ...log, time_ago: formatTimeAgo(log.created_at) }));

    res.json({
      stats: stats,
      upcomingActivities: activitiesResult.rows,
      recentTasks: tasksResult.rows,
      projectTimelines: [], 
      activityLogs: formattedLogs
    });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};