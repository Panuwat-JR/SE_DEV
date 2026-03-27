// ไฟล์: services/employeeService.js
const pool = require('../config/db');

class EmployeeService {
  // ดึงรายชื่อพนักงานทั้งหมด
  async getEmployees() {
    const result = await pool.query(`
      SELECT
        e.employee_id   AS id,
        ep.first_name,
        ep.last_name,
        ep.gender,
        er.name         AS role,
        d.name          AS department,
        e.email,
        e.status,
        e.online_status,
        LEFT(ep.first_name, 1) AS initial
      FROM employees e
      JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
      LEFT JOIN employee_roles er ON ep.role_employee_id = er.role_employee_id
      LEFT JOIN departments   d  ON ep.department_id     = d.department_id
      ORDER BY e.employee_id
    `);
    return result.rows;
  }

  // Dashboard: สถิติ KPI + รายการโครงการ + งานเร่งด่วน
  async getDashboardData() {
    // --- Events (projects) ---
    const eventsResult = await pool.query(`
      SELECT
        e.event_id   AS id,
        e.title,
        COALESCE(se.name, 'ไม่ระบุ') AS status,
        COALESCE(TO_CHAR(e.event_end_date,   'DD MMM YYYY'), 'ยังไม่ระบุ') AS deadline,
        e.budget
      FROM events e
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      ORDER BY e.event_id DESC
    `);

    // --- Task stats per event ---
    const taskStatsResult = await pool.query(`
      SELECT
        t.event_id,
        COUNT(*)                                   AS total_tasks,
        COUNT(*) FILTER (WHERE ts.slug = 'done')   AS done_tasks,
        COUNT(*) FILTER (WHERE ts.slug = 'pending') AS pending_tasks
      FROM tasks t
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      GROUP BY t.event_id
    `);
    const taskMap = {};
    taskStatsResult.rows.forEach(r => {
      taskMap[r.event_id] = {
        total:   parseInt(r.total_tasks)   || 0,
        done:    parseInt(r.done_tasks)    || 0,
        pending: parseInt(r.pending_tasks) || 0,
      };
    });

    // --- Team count per event ---
    const teamsResult = await pool.query(`
      SELECT event_id, COUNT(*) AS team_count
      FROM mapping_event_teams
      GROUP BY event_id
    `);
    const teamMap = {};
    teamsResult.rows.forEach(r => { teamMap[r.event_id] = parseInt(r.team_count) || 0; });

    // --- Participant count per event (via teams) ---
    const participantsResult = await pool.query(`
      SELECT met.event_id, COUNT(pp.participant_profile_id) AS participant_count
      FROM mapping_event_teams met
      JOIN participant_profiles pp ON pp.team_id = met.team_id
      GROUP BY met.event_id
    `);
    const participantMap = {};
    participantsResult.rows.forEach(r => { participantMap[r.event_id] = parseInt(r.participant_count) || 0; });

    // Enrich projects
    const projects = eventsResult.rows.map(ev => {
      const ts = taskMap[ev.id] || { total: 0, done: 0, pending: 0 };
      const progress = ts.total > 0 ? Math.round((ts.done / ts.total) * 100) : 0;
      const statusColorMap = {
        'กำลังดำเนินการ': 'bg-emerald-100 text-emerald-700',
        'เปิดรับสมัคร':   'bg-blue-100 text-blue-700',
        'วางแผน':         'bg-purple-100 text-purple-700',
        'ดำเนินการสำเร็จ':'bg-gray-100 text-gray-600',
        'ยกเลิก':         'bg-red-100 text-red-700',
      };
      return {
        id:           ev.id,
        title:        ev.title,
        status:       ev.status,
        statusColor:  statusColorMap[ev.status] || 'bg-gray-100 text-gray-600',
        deadline:     ev.deadline,
        teams:        teamMap[ev.id] || 0,
        participants: participantMap[ev.id] || 0,
        tasks:        ts.total,
        tasksDone:    ts.done,
        issues:       ts.pending,
        progress,
      };
    });

    // --- Urgent tasks (priority สูง, ยังไม่เสร็จ) ---
    const urgentResult = await pool.query(`
      SELECT
        t.task_id         AS id,
        t.task_name       AS name,
        COALESCE(ev.title, 'ไม่ระบุ') AS project,
        pl.name           AS priority,
        COALESCE(
          CASE
            WHEN t.due_date::date = CURRENT_DATE       THEN 'วันนี้'
            WHEN t.due_date::date = CURRENT_DATE + 1   THEN 'พรุ่งนี้'
            ELSE TO_CHAR(t.due_date, 'DD MMM')
          END, 'ไม่ระบุ'
        ) AS deadline
      FROM tasks t
      LEFT JOIN events        ev ON t.event_id    = ev.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      WHERE ts.slug <> 'done'
        AND pl.name  = 'สูง'
      ORDER BY t.due_date NULLS LAST
      LIMIT 5
    `);

    // --- KPI stats ---
    const totalProjects   = projects.length;
    const activeProjects  = projects.filter(p =>
      ['กำลังดำเนินการ', 'เปิดรับสมัคร'].includes(p.status)
    ).length;
    const totalParticipants = projects.reduce((s, p) => s + p.participants, 0);
    const totalIssues       = projects.reduce((s, p) => s + p.issues, 0);

    return {
      stats: { totalProjects, activeProjects, totalParticipants, totalIssues },
      projects,
      urgentTasks: urgentResult.rows,
    };
  }
}

module.exports = new EmployeeService();
