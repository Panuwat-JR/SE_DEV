const pool = require('../config/db');

const DEMO_HASH = '$2b$10$X9kl7g/.example.hash.placeholder.for.demo.only';

async function resolveFacultyId(client, name) {
  const n = String(name || '').trim();
  if (!n) return null;
  const r = await client.query(`SELECT faculty_id FROM faculties WHERE name = $1 LIMIT 1`, [n]);
  if (r.rows[0]) return r.rows[0].faculty_id;
  const ins = await client.query(`INSERT INTO faculties (name) VALUES ($1) RETURNING faculty_id`, [n]);
  return ins.rows[0].faculty_id;
}

async function resolveMajorId(client, name) {
  const n = String(name || '').trim();
  if (!n) return null;
  const r = await client.query(`SELECT major_id FROM majors WHERE name = $1 LIMIT 1`, [n]);
  if (r.rows[0]) return r.rows[0].major_id;
  const ins = await client.query(`INSERT INTO majors (name) VALUES ($1) RETURNING major_id`, [n]);
  return ins.rows[0].major_id;
}

async function resolveParticipantTypeId(client, typeLabel) {
  const t = String(typeLabel || '').trim();
  if (t) {
    const r = await client.query(
      `SELECT participant_type_id FROM participant_types WHERE name = $1 LIMIT 1`,
      [t]
    );
    if (r.rows[0]) return r.rows[0].participant_type_id;
    const ins = await client.query(
      `INSERT INTO participant_types (name) VALUES ($1) RETURNING participant_type_id`,
      [t]
    );
    return ins.rows[0].participant_type_id;
  }
  const r2 = await client.query(
    `SELECT participant_type_id FROM participant_types ORDER BY participant_type_id ASC LIMIT 1`
  );
  return r2.rows[0]?.participant_type_id ?? null;
}

exports.listParticipants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        pp.participant_profile_id AS id,
        COALESCE(pp.firstname, '') AS firstname,
        COALESCE(pp.lastname, '') AS lastname,
        COALESCE(f.name, '') AS faculty,
        COALESCE(m.name, '') AS major,
        COALESCE(pp.student_id, '') AS student_id,
        pp.year_of_study,
        COALESCE(pp.phone_number, '') AS phone,
        COALESCE(p.email, '') AS email,
        COALESCE(t.name, 'ไม่ระบุทีม') AS team_name,
        pp.team_id,
        COALESCE(pt.name, 'นิสิต/นักศึกษา') AS type
      FROM participant_profiles pp
      LEFT JOIN faculties f ON f.faculty_id = pp.faculty_id
      LEFT JOIN majors m ON m.major_id = pp.major_id
      LEFT JOIN participant_types pt ON pt.participant_type_id = pp.participant_type_id
      LEFT JOIN teams t ON t.team_id = pp.team_id
      LEFT JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
      ORDER BY pp.participant_profile_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('listParticipants:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createParticipant = async (req, res) => {
  const {
    firstname,
    lastname,
    team_id,
    faculty,
    major,
    student_id,
    year_of_study,
    phone,
    email,
    type,
  } = req.body;

  const fn = String(firstname || '').trim();
  const mail = String(email || '').trim();
  if (!fn) return res.status(400).json({ error: 'ต้องระบุชื่อ' });
  if (!mail) return res.status(400).json({ error: 'ต้องระบุอีเมล (สำหรับบัญชีในระบบ)' });

  const tid =
    team_id === '' || team_id === null || team_id === undefined
      ? null
      : parseInt(team_id, 10);
  if (tid != null && Number.isNaN(tid)) {
    return res.status(400).json({ error: 'รหัสทีมไม่ถูกต้อง' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (tid != null) {
      const tr = await client.query(`SELECT 1 FROM teams WHERE team_id = $1`, [tid]);
      if (tr.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'ไม่พบทีมที่เลือก' });
      }
    }

    const facultyId = await resolveFacultyId(client, faculty);
    const majorId = await resolveMajorId(client, major);
    const typeId = await resolveParticipantTypeId(client, type);

    const yr =
      year_of_study === '' || year_of_study === null || year_of_study === undefined
        ? null
        : parseInt(year_of_study, 10);
    const yearVal = Number.isNaN(yr) ? null : yr;

    const insP = await client.query(
      `
      INSERT INTO participant_profiles (
        team_id, faculty_id, major_id, participant_type_id,
        firstname, lastname, student_id, year_of_study, phone_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING participant_profile_id AS id
    `,
      [
        tid,
        facultyId,
        majorId,
        typeId,
        fn,
        String(lastname || '').trim() || null,
        String(student_id || '').trim() || null,
        yearVal,
        String(phone || '').trim() || null,
      ]
    );
    const profileId = insP.rows[0].id;

    await client.query(
      `
      INSERT INTO participants (participant_profile_id, email, password_hash, status)
      VALUES ($1, $2, $3, 'active')
    `,
      [profileId, mail, DEMO_HASH]
    );

    await client.query('COMMIT');

    const row = await pool.query(
      `
      SELECT
        pp.participant_profile_id AS id,
        COALESCE(pp.firstname, '') AS firstname,
        COALESCE(pp.lastname, '') AS lastname,
        COALESCE(f.name, '') AS faculty,
        COALESCE(m.name, '') AS major,
        COALESCE(pp.student_id, '') AS student_id,
        pp.year_of_study,
        COALESCE(pp.phone_number, '') AS phone,
        COALESCE(p.email, '') AS email,
        COALESCE(t.name, 'ไม่ระบุทีม') AS team_name,
        pp.team_id,
        COALESCE(pt.name, 'นิสิต/นักศึกษา') AS type
      FROM participant_profiles pp
      LEFT JOIN faculties f ON f.faculty_id = pp.faculty_id
      LEFT JOIN majors m ON m.major_id = pp.major_id
      LEFT JOIN participant_types pt ON pt.participant_type_id = pp.participant_type_id
      LEFT JOIN teams t ON t.team_id = pp.team_id
      LEFT JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
      WHERE pp.participant_profile_id = $1
    `,
      [profileId]
    );

    res.status(201).json({ message: 'บันทึกสำเร็จ', data: row.rows[0] });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });
    }
    console.error('createParticipant:', err.message);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.deleteParticipant = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'รหัสไม่ถูกต้อง' });
  try {
    const r = await pool.query(
      `DELETE FROM participant_profiles WHERE participant_profile_id = $1 RETURNING participant_profile_id`,
      [id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'ไม่พบผู้เข้าร่วม' });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    console.error('deleteParticipant:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
