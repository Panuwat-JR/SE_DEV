const pool = require('../config/db');

class ParticipantService {
  async getProjectList(participantName) {
    const result = await pool.query(`
      SELECT 
        e.event_id AS id,
        e.title,
        COALESCE(se.name, 'กำลังดำเนินการ') AS status,
        CASE 
          WHEN se.slug = 'completed' THEN 'bg-gray-100 text-gray-600 border-gray-200'
          WHEN se.slug = 'in_progress' THEN 'bg-emerald-100 text-emerald-700 border-emerald-200'
          ELSE 'bg-blue-100 text-blue-700 border-blue-200'
        END AS "statusColor",
        t.name AS team,
        'หัวหน้าทีม' AS role,
        COALESCE(CAST(e.prize_pool AS TEXT) || ' บาท', 'ไม่ระบุ') AS prize
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE pp.firstname = $1
    `, [participantName]);
    return result.rows;
  }

  async getTaskSummary(projectId) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ts.slug = 'completed') as done
      FROM tasks
      LEFT JOIN task_statuses ts ON tasks.status_task_id = ts.status_task_id
      WHERE event_id = $1
    `, [projectId]);
    return result.rows[0];
  }

  async getNextTask(projectId) {
    const result = await pool.query(`
      SELECT task_name, TO_CHAR(due_date, 'DD/MM/YYYY') as deadline
      FROM tasks
      LEFT JOIN task_statuses ts ON tasks.status_task_id = ts.status_task_id
      WHERE event_id = $1 AND COALESCE(ts.slug, '') != 'completed'
      ORDER BY due_date ASC LIMIT 1
    `, [projectId]);
    return result.rows[0];
  }

  async getProjectDetail(projectId, participantName) {
    const result = await pool.query(`
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
    `, [projectId, participantName]);
    return result.rows[0];
  }

  async getAllTasks(projectId) {
    const result = await pool.query(`
      SELECT 
        task_id AS id,
        task_name AS name,
        (SELECT slug FROM task_statuses WHERE status_task_id = tasks.status_task_id) = 'completed' AS done
      FROM tasks
      WHERE event_id = $1
      ORDER BY task_id ASC
    `, [projectId]);
    return result.rows;
  }
}

module.exports = new ParticipantService();
