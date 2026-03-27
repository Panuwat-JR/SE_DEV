const pool = require('../config/db');

/** ค่าเริ่มต้นเมื่อไม่มี header/query — กำหนดทับด้วย DEMO_PARTICIPANT_FIRSTNAME ใน .env */
const DEMO_PARTICIPANT_FIRSTNAME = 'ปิยะ';

function formatBytes(n) {
  const v = Number(n);
  if (!v || v <= 0) return '—';
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

class ParticipantService {
  async getTeamIdByParticipantName(participantName) {
    const result = await pool.query(
      `
      SELECT pp.team_id
      FROM participant_profiles pp
      WHERE pp.team_id IS NOT NULL
        AND TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
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
        f.name AS faculty,
        p.email AS email
      FROM participant_profiles pp
      LEFT JOIN faculties f ON pp.faculty_id = f.faculty_id
      LEFT JOIN participants p ON pp.participant_profile_id = p.participant_profile_id
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
        phone: m.phone || '',
        email: m.email || ''
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

  async addTeamMemberWithAccount({ participantName, fullName, email, facultyName, yearOfStudy }) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) throw new Error('Participant has no team');

    const name = String(fullName || '').trim();
    if (!name) throw new Error('Name is required');
    const mail = String(email || '').trim();
    if (!mail) throw new Error('Email is required');

    const parts = name.split(/\s+/).filter(Boolean);
    const firstname = parts[0] || name;
    const lastname = parts.slice(1).join(' ') || null;

    // faculty: find by exact name; if not found and user provided, create new faculty (data only)
    let facultyId = null;
    const fac = String(facultyName || '').trim();
    if (fac) {
      const facRes = await pool.query(`SELECT faculty_id FROM faculties WHERE name = $1 LIMIT 1`, [fac]);
      facultyId = facRes.rows[0]?.faculty_id ?? null;
      if (!facultyId) {
        const ins = await pool.query(`INSERT INTO faculties (name) VALUES ($1) RETURNING faculty_id`, [fac]);
        facultyId = ins.rows[0]?.faculty_id ?? null;
      }
    }

    const year = yearOfStudy === undefined || yearOfStudy === null || yearOfStudy === ''
      ? null
      : parseInt(yearOfStudy, 10);

    // 1) create profile
    const profileIns = await pool.query(
      `
      INSERT INTO participant_profiles (team_id, faculty_id, firstname, lastname, year_of_study)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING participant_profile_id AS id, firstname, lastname, year_of_study AS year
      `,
      [teamId, facultyId, firstname, lastname, Number.isNaN(year) ? null : year]
    );
    const profile = profileIns.rows[0];

    // 2) create participant account row (email required by schema)
    // demo placeholder hash (ระบบ auth จริงค่อยเปลี่ยน)
    const hash = '$2b$10$X9kl7g/.example.hash.placeholder.for.demo.only';
    await pool.query(
      `
      INSERT INTO participants (participant_profile_id, email, password_hash, status)
      VALUES ($1, $2, $3, $4)
      `,
      [profile.id, mail, hash, 'active']
    );

    return { ...profile, email: mail, faculty_id: facultyId };
  }

  async removeTeamMember({ participantName, memberProfileId }) {
    const teamId = await this.getTeamIdByParticipantName(participantName);
    if (!teamId) throw new Error('Participant has no team');

    const id = parseInt(memberProfileId, 10);
    if (Number.isNaN(id)) throw new Error('Invalid member id');

    // กันลบตัวเอง — ใช้ exact match เพื่อป้องกันชื่อซ้ำกัน
    const selfRes = await pool.query(
      `
      SELECT participant_profile_id
      FROM participant_profiles
      WHERE team_id = $1 AND TRIM(LOWER(firstname)) = TRIM(LOWER($2))
      LIMIT 1
      `,
      [teamId, participantName]
    );
    const selfId = selfRes.rows[0]?.participant_profile_id ?? null;
    if (selfId && id === selfId) throw new Error('Cannot remove team leader');

    // ลบเฉพาะสมาชิกที่อยู่ในทีมเดียวกัน
    const del = await pool.query(
      `
      DELETE FROM participant_profiles
      WHERE participant_profile_id = $1 AND team_id = $2
      RETURNING participant_profile_id AS id
      `,
      [id, teamId]
    );
    return { deleted: del.rowCount };
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

  getDemoParticipantFirstname() {
    const env = process.env.DEMO_PARTICIPANT_FIRSTNAME;
    if (env != null && String(env).trim() !== '') return String(env).trim();
    return DEMO_PARTICIPANT_FIRSTNAME;
  }

  /** โปรไฟล์สำหรับพอร์ทัล — ชื่อจากฐานข้อมูล + isTeamLeader ตามกฎเดียวกับ getTeamForParticipant */
  async getProfileForParticipant(participantName) {
    const profileRes = await pool.query(
      `
      SELECT
        pp.participant_profile_id,
        TRIM(BOTH FROM COALESCE(pp.firstname, '')) AS firstname,
        TRIM(BOTH FROM COALESCE(pp.lastname, '')) AS lastname,
        pp.year_of_study,
        pp.team_id,
        COALESCE(f.name, '') AS faculty,
        COALESCE(t.name, '') AS team_name,
        COALESCE(t.project_name, '') AS project_name,
        COALESCE(p.email, '') AS email
      FROM participant_profiles pp
      LEFT JOIN faculties f ON f.faculty_id = pp.faculty_id
      LEFT JOIN teams t ON t.team_id = pp.team_id
      LEFT JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
      ORDER BY pp.participant_profile_id ASC
      LIMIT 1
      `,
      [participantName]
    );
    const row = profileRes.rows[0];
    if (!row) return null;

    const first = row.firstname || '';
    const last = row.lastname || '';
    const displayName = `${first}${last ? ` ${last}` : ''}`.trim() || participantName;

    let isTeamLeader = false;
    const tid = row.team_id;
    if (tid != null) {
      const leaderR = await pool.query(
        `
        WITH ranked AS (
          SELECT
            pp.participant_profile_id,
            ROW_NUMBER() OVER (ORDER BY pp.participant_profile_id ASC) AS rn
          FROM participant_profiles pp
          INNER JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
          WHERE pp.team_id = $1
        )
        SELECT participant_profile_id FROM ranked WHERE rn = 1
        LIMIT 1
        `,
        [tid]
      );
      const leaderId = leaderR.rows[0]?.participant_profile_id;
      isTeamLeader = leaderId != null && leaderId === row.participant_profile_id;
    }

    const initial = (displayName || '?').charAt(0);

    return {
      participantProfileId: row.participant_profile_id,
      firstname: first,
      lastname: last,
      displayName,
      email: row.email,
      year: row.year_of_study,
      faculty: row.faculty,
      teamName: row.team_name || null,
      projectLabel: row.project_name || null,
      isTeamLeader,
      initial,
    };
  }

  async resolveParticipantId(participantName) {
    const r = await pool.query(
      `
      SELECT p.participant_id
      FROM participants p
      JOIN participant_profiles pp ON pp.participant_profile_id = p.participant_profile_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
      LIMIT 1
    `,
      [participantName]
    );
    return r.rows[0]?.participant_id ?? null;
  }

  async resolveTeamId(participantName) {
    const r = await pool.query(
      `
      SELECT pp.team_id
      FROM participant_profiles pp
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1)) AND pp.team_id IS NOT NULL
      LIMIT 1
    `,
      [participantName]
    );
    return r.rows[0]?.team_id ?? null;
  }

  async getProjectList(participantName) {
    const result = await pool.query(
      `
      WITH team_leaders AS (
        SELECT DISTINCT ON (ppx.team_id)
          ppx.team_id,
          ppx.participant_profile_id AS leader_profile_id
        FROM participant_profiles ppx
        INNER JOIN participants px ON px.participant_profile_id = ppx.participant_profile_id
        WHERE ppx.team_id IS NOT NULL
        ORDER BY ppx.team_id, ppx.participant_profile_id ASC
      )
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
        CASE
          WHEN tl.leader_profile_id IS NOT NULL
            AND pp.participant_profile_id = tl.leader_profile_id
          THEN 'หัวหน้าทีม'
          ELSE 'สมาชิกทีม'
        END AS role,
        COALESCE(CAST(e.prize_pool AS TEXT) || ' บาท', 'ไม่ระบุ') AS prize,
        TO_CHAR(e.event_start_date, 'DD/MM/YYYY') AS start_date,
        TO_CHAR(e.event_end_date, 'DD/MM/YYYY') AS end_date
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN team_leaders tl ON tl.team_id = t.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
    `,
      [participantName]
    );
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
        (
          SELECT COUNT(DISTINCT d.document_id)::int
          FROM tasks tk
          JOIN mapping_doc_tasks mdt ON mdt.task_id = tk.task_id
          JOIN documents d ON d.document_id = mdt.document_id
          WHERE tk.event_id = e.event_id
        ) AS "documentCount",
        TO_CHAR(e.event_start_date, 'DD/MM/YYYY') as start_date,
        TO_CHAR(e.event_end_date, 'DD/MM/YYYY') as end_date
      FROM events e
      JOIN mapping_event_teams met ON e.event_id = met.event_id
      JOIN teams t ON met.team_id = t.team_id
      JOIN participant_profiles pp ON t.team_id = pp.team_id
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      WHERE e.event_id = $1 AND TRIM(LOWER(pp.firstname)) = TRIM(LOWER($2))
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

  /** เอกสารที่โยงผ่านงาน (mapping_doc_tasks) ของอีเวนต์ที่ทีมเข้าร่วม */
  async getDocumentsForParticipant(participantName) {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (d.document_id)
        d.document_id AS id,
        d.name,
        COALESCE(ds.name, 'ไม่ระบุ') AS status,
        TO_CHAR(d.created_at AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        e.title AS project,
        d.file_size AS "fileSizeBytes",
        d.file_storage_path AS "filePath",
        d.file_type AS "fileType"
      FROM participant_profiles pp
      JOIN teams t ON t.team_id = pp.team_id
      JOIN mapping_event_teams met ON met.team_id = t.team_id
      JOIN events e ON e.event_id = met.event_id
      JOIN tasks tk ON tk.event_id = e.event_id
      JOIN mapping_doc_tasks mdt ON mdt.task_id = tk.task_id
      JOIN documents d ON d.document_id = mdt.document_id
      LEFT JOIN document_statuses ds ON ds.doc_status_id = d.doc_status_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
      ORDER BY d.document_id, d.updated_at DESC NULLS LAST
    `,
      [participantName]
    );
    return result.rows.map((row) => ({
      ...row,
      size: formatBytes(row.fileSizeBytes),
    }));
  }

  async createParticipantDocument(participantName, { name, eventId, fileName, fileSize }) {
    const access = await pool.query(
      `
      SELECT 1
      FROM participant_profiles pp
      JOIN mapping_event_teams met ON met.team_id = pp.team_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1)) AND met.event_id = $2
      LIMIT 1
    `,
      [participantName, eventId]
    );
    if (access.rows.length === 0) {
      const err = new Error('FORBIDDEN_EVENT');
      err.code = 'FORBIDDEN_EVENT';
      throw err;
    }

    const taskR = await pool.query(
      `SELECT task_id FROM tasks WHERE event_id = $1 ORDER BY task_id ASC LIMIT 1`,
      [eventId]
    );
    if (taskR.rows.length === 0) {
      const err = new Error('NO_TASKS_FOR_EVENT');
      err.code = 'NO_TASKS_FOR_EVENT';
      throw err;
    }
    const taskId = taskR.rows[0].task_id;

    const statusR = await pool.query(
      `SELECT doc_status_id FROM document_statuses WHERE slug IN ('draft', 'pending_approval') ORDER BY doc_status_id LIMIT 1`
    );
    const docStatusId = statusR.rows[0]?.doc_status_id ?? null;

    const insert = await pool.query(
      `
      INSERT INTO documents (doc_status_id, name, file_storage_path, file_type, file_size, generation_status)
      VALUES ($1, $2, $3, $4, $5, 'registered')
      RETURNING document_id, name, created_at, file_size, file_storage_path, file_type, doc_status_id
    `,
      [docStatusId, name || fileName || 'เอกสารใหม่', fileName || null, null, fileSize || null]
    );

    const doc = insert.rows[0];
    await pool.query(
      `INSERT INTO mapping_doc_tasks (task_id, document_id) VALUES ($1, $2)
       ON CONFLICT (task_id, document_id) DO NOTHING`,
      [taskId, doc.document_id]
    );

    const ds = await pool.query(`SELECT name FROM document_statuses WHERE doc_status_id = $1`, [doc.doc_status_id]);
    const eventTitle = await pool.query(`SELECT title FROM events WHERE event_id = $1`, [eventId]);

    return {
      id: doc.document_id,
      name: doc.name,
      status: ds.rows[0]?.name || 'ร่าง',
      date: new Date(doc.created_at).toLocaleDateString('th-TH'),
      project: eventTitle.rows[0]?.title || '',
      fileSizeBytes: doc.file_size,
      size: formatBytes(doc.file_size),
      filePath: doc.file_storage_path,
      fileType: doc.file_type,
    };
  }

  /** สมาชิกทีม + โควต้า — หัวหน้า = คนแรกตาม participant_profile_id (สาธิต) */
  async getTeamForParticipant(participantName) {
    const teamR = await pool.query(
      `
      SELECT
        t.team_id AS "teamId",
        t.name AS "teamName",
        COALESCE(t.project_name, (
          SELECT ev2.title FROM mapping_event_teams met2
          JOIN events ev2 ON ev2.event_id = met2.event_id
          WHERE met2.team_id = t.team_id
          ORDER BY ev2.event_id DESC
          LIMIT 1
        )) AS "projectLabel"
      FROM participant_profiles pp
      JOIN teams t ON t.team_id = pp.team_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
      LIMIT 1
    `,
      [participantName]
    );
    if (teamR.rows.length === 0) return null;

    const { teamId, teamName, projectLabel } = teamR.rows[0];

    const maxR = await pool.query(
      `
      SELECT COALESCE(MAX(e.max_team_member), 5)::int AS max_members
      FROM mapping_event_teams met
      JOIN events e ON e.event_id = met.event_id
      WHERE met.team_id = $1
    `,
      [teamId]
    );
    const maxMembers = maxR.rows[0]?.max_members ?? 5;

    const membersR = await pool.query(
      `
      WITH ranked AS (
        SELECT
          pp.participant_profile_id,
          TRIM(BOTH FROM pp.firstname || ' ' || COALESCE(pp.lastname, '')) AS full_name,
          p.email,
          COALESCE(pp.phone_number, '') AS phone,
          COALESCE(f.name, '') AS faculty,
          COALESCE(pp.year_of_study, 0) AS year_of_study,
          ROW_NUMBER() OVER (ORDER BY pp.participant_profile_id ASC) AS rn
        FROM participant_profiles pp
        JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
        LEFT JOIN faculties f ON f.faculty_id = pp.faculty_id
        WHERE pp.team_id = $1
      )
      SELECT
        participant_profile_id AS id,
        full_name AS name,
        email,
        phone,
        faculty,
        year_of_study AS year,
        (rn = 1) AS "isLeader",
        UPPER(SUBSTRING(full_name FROM 1 FOR 1)) AS initial
      FROM ranked
      ORDER BY participant_profile_id
    `,
      [teamId]
    );

    const palette = ['bg-emerald-600', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-600'];
    const members = membersR.rows.map((m, i) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone || '—',
      faculty: m.faculty || '—',
      year: m.year,
      initial: m.initial || '?',
      color: palette[i % palette.length],
      isLeader: m.isLeader,
    }));

    const leaderCount = members.filter((x) => x.isLeader).length;

    return {
      teamId,
      name: teamName,
      project: projectLabel || '—',
      maxMembers,
      leaderCount,
      members,
    };
  }

  /** แจ้งเตือนเชิงสังเคราะห์จากงานที่ยังไม่เสร็จและกำหนดส่ง */
  async getNotificationsForParticipant(participantName) {
    const rows = await pool.query(
      `
      SELECT
        tk.task_id,
        tk.task_name,
        tk.due_date,
        e.event_id,
        e.title AS event_title,
        COALESCE(ts.slug, '') AS task_slug
      FROM participant_profiles pp
      JOIN teams t ON t.team_id = pp.team_id
      JOIN mapping_event_teams met ON met.team_id = t.team_id
      JOIN events e ON e.event_id = met.event_id
      JOIN tasks tk ON tk.event_id = e.event_id
      LEFT JOIN task_statuses ts ON ts.status_task_id = tk.status_task_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
        AND COALESCE(ts.slug, '') != 'completed'
      ORDER BY tk.due_date ASC NULLS LAST
    `,
      [participantName]
    );

    const now = new Date();
    const list = [];
    const seen = new Set();

    for (const r of rows.rows) {
      const due = r.due_date ? new Date(r.due_date) : null;
      const id = `task-${r.task_id}`;
      if (seen.has(id)) continue;
      seen.add(id);

      let type = 'status';
      let title = 'งานที่ต้องทำ';
      let body = `งาน "${r.task_name}" ในโครงการ "${r.event_title}" ยังไม่เสร็จ`;
      if (due && !Number.isNaN(due.getTime())) {
        const days = Math.ceil((due - now) / (86400000));
        type = 'deadline';
        title = days < 0 ? 'เลยกำหนดส่ง' : days <= 7 ? 'ใกล้ถึงกำหนดส่ง' : 'กำหนดส่งงาน';
        body =
          days < 0
            ? `งาน "${r.task_name}" (${r.event_title}) เลยกำหนดแล้ว`
            : `งาน "${r.task_name}" (${r.event_title}) ครบกำหนดในอีก ${days} วัน`;
      }

      list.push({
        id,
        type,
        title,
        body,
        project: r.event_title,
        occurredAt: (due && !Number.isNaN(due.getTime()) ? due : now).toISOString(),
      });
    }

    return list;
  }

  /** เจ้าหน้าที่ที่ map กับอีเวนต์เดียวกับทีม */
  async getContactsForParticipant(participantName) {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (em.employee_id)
        em.employee_id AS id,
        TRIM(BOTH FROM ep.first_name || ' ' || COALESCE(ep.last_name, '')) AS name,
        COALESCE(er.name, 'เจ้าหน้าที่') AS role,
        ev.title AS project,
        em.email,
        COALESCE(dp.name, 'NU SEED') AS dept,
        COALESCE(em.online_status, 'offline') AS online_status
      FROM participant_profiles pp
      JOIN mapping_event_teams met ON met.team_id = pp.team_id
      JOIN mapping_event_employees mee ON mee.event_id = met.event_id
      JOIN employees em ON em.employee_id = mee.employee_id
      JOIN employee_profiles ep ON ep.employee_profile_id = em.employee_profile_id
      LEFT JOIN employee_roles er ON er.role_employee_id = ep.role_employee_id
      LEFT JOIN departments dp ON dp.department_id = ep.department_id
      JOIN events ev ON ev.event_id = met.event_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
      ORDER BY em.employee_id, ev.event_id
    `,
      [participantName]
    );

    return result.rows.map((c) => ({
      ...c,
      online: String(c.online_status || '').toLowerCase() === 'online',
      initial: (c.name || '?').charAt(0),
      color: 'bg-blue-600',
    }));
  }

  /** ปฏิทิน: งาน + วันเริ่ม/จบ อีเวนต์ */
  async getCalendarForParticipant(participantName) {
    const tasks = await pool.query(
      `
      SELECT
        TO_CHAR(tk.due_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        tk.task_name AS title,
        e.title AS project,
        'task' AS kind
      FROM participant_profiles pp
      JOIN mapping_event_teams met ON met.team_id = pp.team_id
      JOIN events e ON e.event_id = met.event_id
      JOIN tasks tk ON tk.event_id = e.event_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
        AND tk.due_date IS NOT NULL
    `,
      [participantName]
    );

    const evs = await pool.query(
      `
      SELECT
        TO_CHAR(e.event_start_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d1,
        TO_CHAR(e.event_end_date AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS d2,
        e.title AS project
      FROM participant_profiles pp
      JOIN mapping_event_teams met ON met.team_id = pp.team_id
      JOIN events e ON e.event_id = met.event_id
      WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
        AND (e.event_start_date IS NOT NULL OR e.event_end_date IS NOT NULL)
    `,
      [participantName]
    );

    const events = [];
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];
    let ci = 0;
    for (const r of evs.rows) {
      const c = colors[ci % colors.length];
      ci += 1;
      if (r.d1) {
        events.push({
          date: r.d1,
          title: `เริ่มโครงการ: ${r.project}`,
          project: r.project,
          color: c,
          textColor: 'text-gray-800',
          bg: 'bg-blue-50',
          kind: 'event',
        });
      }
      if (r.d2 && r.d2 !== r.d1) {
        events.push({
          date: r.d2,
          title: `สิ้นสุดโครงการ: ${r.project}`,
          project: r.project,
          color: c,
          textColor: 'text-gray-800',
          bg: 'bg-emerald-50',
          kind: 'event',
        });
      }
    }

    const taskEvents = tasks.rows.map((t, i) => {
      const c = colors[i % colors.length];
      return {
        date: t.date,
        title: t.title,
        project: t.project,
        color: c,
        textColor: 'text-gray-800',
        bg: 'bg-sky-50',
        kind: 'task',
      };
    });

    return [...taskEvents, ...events];
  }

  async saveContactMessage(participantName, { employeeId, subject, body }) {
    await pool.query(
      `
      INSERT INTO participant_contact_messages (demo_participant_firstname, employee_id, subject, body)
      VALUES ($1, $2, $3, $4)
    `,
      [participantName, employeeId || null, subject || null, body]
    );
  }

  async listFeedbacksForParticipant(participantName) {
    const pid = await this.resolveParticipantId(participantName);
    if (!pid) return [];
    const r = await pool.query(
      `
      SELECT
        f.feedback_id AS id,
        f.rating,
        f.comment,
        TO_CHAR(f.create_at AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date
      FROM feedbacks f
      WHERE f.participant_id = $1
      ORDER BY f.create_at DESC
    `,
      [pid]
    );
    const prefix = '[participant_portal] ';
    return r.rows.map((row) => {
      let project = 'ทั่วไป';
      let text = row.comment || '';
      if (text.startsWith(prefix)) {
        try {
          const meta = JSON.parse(text.slice(prefix.length));
          project = meta.projectTitle || project;
          text = meta.comment != null ? String(meta.comment) : '';
        } catch {
          /* เก็บข้อความดิบ */
        }
      }
      return {
        id: row.id,
        rating: row.rating,
        text,
        project,
        date: row.date,
      };
    });
  }

  async createFeedbackForParticipant(participantName, { rating, comment, aspects, projectTitle }) {
    const pid = await this.resolveParticipantId(participantName);
    if (!pid) {
      const err = new Error('PARTICIPANT_NOT_FOUND');
      err.code = 'PARTICIPANT_NOT_FOUND';
      throw err;
    }

    // ตรวจว่า projectTitle เป็นโครงการที่ participant เข้าร่วมจริง (ถ้ามีส่งมา)
    let resolvedProjectTitle = null;
    if (projectTitle && String(projectTitle).trim()) {
      const check = await pool.query(
        `
        SELECT e.title
        FROM participant_profiles pp
        JOIN mapping_event_teams met ON met.team_id = pp.team_id
        JOIN events e ON e.event_id = met.event_id
        WHERE TRIM(LOWER(pp.firstname)) = TRIM(LOWER($1))
          AND TRIM(e.title) = TRIM($2)
        LIMIT 1
        `,
        [participantName, String(projectTitle).trim()]
      );
      if (check.rows.length === 0) {
        const err = new Error('PROJECT_NOT_FOUND');
        err.code = 'PROJECT_NOT_FOUND';
        throw err;
      }
      resolvedProjectTitle = check.rows[0].title;
    }

    const meta = {
      projectTitle: resolvedProjectTitle,
      aspects: aspects || {},
      comment: comment || '',
    };
    const fullComment = `[participant_portal] ${JSON.stringify(meta)}`;
    await pool.query(
      `INSERT INTO feedbacks (participant_id, rating, comment) VALUES ($1, $2, $3)`,
      [pid, rating, fullComment]
    );
  }
}

module.exports = new ParticipantService();
