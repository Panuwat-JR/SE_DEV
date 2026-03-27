const pool = require('../config/db');

class ParticipantService {
  async getTeamIdByParticipantName(participantName) {
    const result = await pool.query(
      `
      SELECT pp.team_id
      FROM participant_profiles pp
      WHERE pp.team_id IS NOT NULL
        AND TRIM(pp.firstname) ILIKE '%' || TRIM($1) || '%'
      LIMIT 1
      `,
      [participantName]
    );
    return result.rows[0]?.team_id ?? null;
  }

  async getTeamInfo(participantName) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) return null;

    const teamRes = await pool.query(
      `
      SELECT team_id AS id, name, COALESCE(project_name, '') AS project_name
      FROM teams
      WHERE team_id = $1
      LIMIT 1
      `,
      [teamId]
    );
    const team = teamRes.rows[0];
    if (!team) return null;

    const membersRes = await pool.query(
      `
      SELECT
        pp.participant_profile_id AS id,
        COALESCE(pp.firstname, '') AS firstname,
        COALESCE(pp.lastname, '') AS lastname,
        pp.phone_number AS phone,
        pp.year_of_study AS year,
        f.name AS faculty
      FROM participant_profiles pp
      LEFT JOIN faculties f ON pp.faculty_id = f.faculty_id
      WHERE pp.team_id = $1
      ORDER BY pp.participant_profile_id ASC
      `,
      [teamId]
    );

    return {
      id: team.id,
      name: team.name,
      project: team.project_name,
      members: membersRes.rows.map((m) => ({
        id: m.id,
        name: `${m.firstname}${m.lastname ? ` ${m.lastname}` : ''}`.trim(),
        faculty: m.faculty || '',
        year: m.year ?? null,
        phone: m.phone || ''
      }))
    };
  }

  async addTeamMember({ participantName, fullName, facultyName, yearOfStudy }) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) throw new Error('Participant has no team');

    const name = String(fullName || '').trim();
    if (!name) throw new Error('Name is required');
    const parts = name.split(/\s+/).filter(Boolean);
    const firstname = parts[0] || name;
    const lastname = parts.slice(1).join(' ') || null;

    let facultyId = null;
    const fac = String(facultyName || '').trim();
    if (fac) {
      const facRes = await pool.query(`SELECT faculty_id FROM faculties WHERE name = $1 LIMIT 1`, [fac]);
      facultyId = facRes.rows[0]?.faculty_id ?? null;
    }

    const year = yearOfStudy === undefined || yearOfStudy === null || yearOfStudy === ''
      ? null
      : parseInt(yearOfStudy, 10);

    const inserted = await pool.query(
      `
      INSERT INTO participant_profiles (team_id, faculty_id, firstname, lastname, year_of_study)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING participant_profile_id AS id, firstname, lastname, year_of_study AS year
      `,
      [teamId, facultyId, firstname, lastname, Number.isNaN(year) ? null : year]
    );
    return inserted.rows[0];
  }

  async listDocumentsForParticipant(participantName) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) return [];

    // จำกัดเอกสารให้อยู่ใน events ที่ทีมนี้เข้าร่วม (match ด้วยชื่อ event)
    const result = await pool.query(
      `
      WITH team_events AS (
        SELECT e.title
        FROM events e
        JOIN mapping_event_teams met ON e.event_id = met.event_id
        WHERE met.team_id = $1
      )
      SELECT
        td.team_doc_id AS id,
        td.file_name AS name,
        td.file_storage_path AS path,
        td.file_type AS type,
        td.file_size AS size,
        td.event_name AS project,
        td.task_name AS task
      FROM team_docs td
      WHERE td.event_name IN (SELECT title FROM team_events)
      ORDER BY td.team_doc_id DESC
      `,
      [teamId]
    );
    return result.rows;
  }

  async createDocument({ participantName, file, project, name }) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) throw new Error('Participant has no team');

    // ตรวจว่า project นี้อยู่ในทีมจริง
    const allowed = await pool.query(
      `
      SELECT 1
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      WHERE met.team_id = $1 AND e.title = $2
      LIMIT 1
      `,
      [teamId, project]
    );
    if (allowed.rowCount === 0) {
      throw new Error('Project not allowed');
    }

    const fileName = name?.trim() || file.originalname;
    const storagePath = `/uploads/${file.filename}`;

    let fileType = file.mimetype || null;
    // file_type ใน DB เป็น VARCHAR(50) — กันค่า MIME ยาวเกิน
    if (fileType && String(fileType).length > 50) {
      fileType = 'application/octet-stream';
    }

    const inserted = await pool.query(
      `
      INSERT INTO team_docs (file_name, file_storage_path, file_type, file_size, event_name, task_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING team_doc_id AS id, file_name AS name, file_storage_path AS path, file_type AS type, file_size AS size, event_name AS project, task_name AS task
      `,
      [
        fileName,
        storagePath,
        fileType,
        Number(file.size) || null,
        project,
        null
      ]
    );
    return inserted.rows[0];
  }

  async deleteDocument({ participantName, docId }) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) return { deleted: 0 };

    // ลบได้เฉพาะเอกสารที่อยู่ใน events ของทีมนี้ (อิง event_name)
    const deleted = await pool.query(
      `
      DELETE FROM team_docs td
      USING mapping_event_teams met, events e
      WHERE td.team_doc_id = $1
        AND td.event_name = e.title
        AND e.event_id = met.event_id
        AND met.team_id = $2
      RETURNING td.file_storage_path AS path
      `,
      [docId, teamId]
    );
    return { deleted: deleted.rowCount, path: deleted.rows[0]?.path ?? null };
  }
  async getProjectList(participantName) {
    const result = await pool.query(`
      SELECT 
        e.event_id AS id,
        e.title,
        COALESCE(se.name, 'กำลังดำเนินการ') AS status,
        se.slug AS "statusSlug",
        CASE 
          WHEN se.slug = 'completed' THEN 'bg-gray-100 text-gray-600 border-gray-200'
          WHEN se.slug = 'in_progress' THEN 'bg-emerald-100 text-emerald-700 border-emerald-200'
          ELSE 'bg-blue-100 text-blue-700 border-blue-200'
        END AS "statusColor",
        t.name AS team,
        'หัวหน้าทีม' AS role,
        COALESCE(CAST(e.prize_pool AS TEXT) || ' บาท', 'ไม่ระบุ') AS prize,
        TO_CHAR(e.event_start_date, 'DD/MM/YYYY') as start_date,
        TO_CHAR(e.event_end_date, 'DD/MM/YYYY') as end_date
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE TRIM(pp.firstname) ILIKE '%' || TRIM($1) || '%'
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
      WHERE e.event_id = $1 AND TRIM(pp.firstname) ILIKE '%' || TRIM($2) || '%'
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
