const pool = require('../config/db');

function timeAgoThai(at) {
  if (!at) return '—';
  const t = at instanceof Date ? at.getTime() : new Date(at).getTime();
  if (Number.isNaN(t)) return '—';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 45) return 'เมื่อสักครู่';
  if (sec < 3600) return `${Math.floor(sec / 60)} นาทีที่แล้ว`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ชั่วโมงที่แล้ว`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} วันที่แล้ว`;
  try {
    return new Date(t).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

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

  /** ฟีดกิจกรรมล่าสุดจากเอกสาร + ทีม (มี timestamp ใน DB) */
  async getActivityLogs(limit = 12) {
    const [docs, teams] = await Promise.all([
      pool.query(`
        SELECT
          d.document_id,
          d.name,
          (
            SELECT e.title
            FROM mapping_doc_tasks mdt
            JOIN tasks tk ON tk.task_id = mdt.task_id
            JOIN events e ON e.event_id = tk.event_id
            WHERE mdt.document_id = d.document_id
            LIMIT 1
          ) AS project_title,
          COALESCE(d.updated_at, d.created_at) AS at
        FROM documents d
        ORDER BY COALESCE(d.updated_at, d.created_at) DESC NULLS LAST
        LIMIT 8
      `),
      pool.query(`
        SELECT team_id, name, COALESCE(NULLIF(TRIM(project_name), ''), '—') AS project_name, create_at AS at
        FROM teams
        ORDER BY team_id DESC
        LIMIT 8
      `),
    ]);

    const rows = [];
    for (const r of docs.rows) {
      const at = r.at ? new Date(r.at) : null;
      rows.push({
        at,
        action_type: 'document',
        title: `เอกสาร: ${r.name}`,
        description: r.project_title ? `โครงการ ${r.project_title}` : 'อัปเดตในระบบ',
      });
    }
    for (const r of teams.rows) {
      const at = r.at ? new Date(r.at) : null;
      rows.push({
        at,
        action_type: 'team',
        title: `ทีม: ${r.name}`,
        description: `โครงการภายในทีม: ${r.project_name}`,
      });
    }

    rows.sort((a, b) => {
      const ta = a.at ? a.at.getTime() : 0;
      const tb = b.at ? b.at.getTime() : 0;
      return tb - ta;
    });

    return rows.slice(0, limit).map((r, idx) => ({
      id: `alog_${idx}_${r.action_type}_${r.at ? r.at.getTime() : idx}`,
      action_type: r.action_type,
      title: r.title,
      description: r.description,
      user_name: 'ระบบ',
      time_ago: timeAgoThai(r.at),
    }));
  }
}

module.exports = new DashboardService();
