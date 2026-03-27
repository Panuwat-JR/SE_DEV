const pool = require('../config/db');

class DashboardService {
  async getStats() {
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');
    const teamsCount = await pool.query('SELECT COUNT(*) FROM teams');
    const tasksCount = await pool.query('SELECT COUNT(*) FROM tasks');
    const budgetQuery = await pool.query('SELECT SUM(budget) as total_budget FROM events');
    const activeEventsCount = await pool.query(`
      SELECT COUNT(*) FROM events e
      JOIN status_events s ON e.status_event_id = s.status_event_id
      WHERE s.slug IN ('in_progress', 'open_registration')
    `);
    const pendingTasksCount = await pool.query(`
      SELECT COUNT(*) FROM tasks t
      JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      WHERE ts.slug = 'pending'
    `);
    const docsCount = await pool.query('SELECT COUNT(*) FROM documents');
    const feedbackAvg = await pool.query('SELECT AVG(rating) as avg_rating FROM feedbacks');

    return {
      total_activities: parseInt(eventsCount.rows[0].count),
      registered_teams: parseInt(teamsCount.rows[0].count),
      total_tasks: parseInt(tasksCount.rows[0].count),
      pending_tasks: parseInt(pendingTasksCount.rows[0].count),
      total_documents: parseInt(docsCount.rows[0].count),
      active_activities: parseInt(activeEventsCount.rows[0].count),
      total_budget: budgetQuery.rows[0].total_budget ? parseFloat(budgetQuery.rows[0].total_budget) : 0,
      avg_feedback: feedbackAvg.rows[0].avg_rating ? parseFloat(feedbackAvg.rows[0].avg_rating).toFixed(1) : '0.0'
    };
  }

  async getUpcomingActivities() {
    const result = await pool.query(`
      SELECT
        e.event_id AS id,
        e.title,
        COALESCE(s.name, 'เปิดรับสมัคร') AS status,
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
        COALESCE(CAST(e.prize_pool AS TEXT), 'ยังไม่ระบุ') AS prize_pool
      FROM events e
      LEFT JOIN status_events s ON e.status_event_id = s.status_event_id
      ORDER BY e.event_id DESC LIMIT 5
    `);
    return result.rows;
  }

  async getRecentTasks() {
    const result = await pool.query(`
      SELECT
        t.task_id AS id,
        t.task_name AS title,
        COALESCE(e.title, 'ไม่ระบุกิจกรรม') AS project_name,
        COALESCE(pl.name, 'ปกติ') AS priority,
        t.progress_percent
      FROM tasks t
      LEFT JOIN events e ON t.event_id = e.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      ORDER BY t.task_id DESC LIMIT 5
    `);
    return result.rows;
  }
}

module.exports = new DashboardService();
