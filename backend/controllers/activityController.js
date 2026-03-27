// ตารางและคอลัมน์ตาม se.sql — โควต้าผู้เข้าร่วมเก็บใน logistics.max_participant
const pool = require('../config/db');

function parseEventDateInput(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    let y = parseInt(m[3], 10);
    const mo = m[2].padStart(2, '0');
    const d = m[1].padStart(2, '0');
    if (y > 2500) y -= 543;
    return `${y}-${mo}-${d}`;
  }
  return null;
}

function parsePrizePool(v) {
  if (v == null || v === '') return null;
  const s = String(v).replace(/,/g, '');
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const x = parseFloat(m[1]);
  return Number.isFinite(x) ? x : null;
}

function parseMaxParticipants(v) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n) || n < 1) return 100;
  return n;
}

/** ทั้งคู่เป็น YYYY-MM-DD หรือ null */
function validateEventDateRange(startIso, endIso) {
  if (startIso && endIso && String(endIso) < String(startIso)) {
    const err = new Error('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
    err.code = 'VALIDATION';
    throw err;
  }
}

exports.createActivity = async (req, res) => {
  const { title, status, date_text, end_date_text, description, max_participants, prize_pool } =
    req.body;
  const titleTrim = String(title || '').trim();
  if (!titleTrim) {
    return res.status(400).json({ error: 'ต้องระบุชื่อกิจกรรม' });
  }

  const statusName = String(status || 'เปิดรับสมัคร').trim();
  const dateIso = parseEventDateInput(date_text);
  const endIso = parseEventDateInput(
    end_date_text != null && end_date_text !== '' ? end_date_text : req.body.end_date_input
  );
  const desc =
    description != null && String(description).trim() !== '' ? String(description).trim() : null;
  const maxP = parseMaxParticipants(max_participants);
  const prize = parsePrizePool(prize_pool);

  try {
    validateEventDateRange(dateIso, endIso);
  } catch (e) {
    if (e.code === 'VALIDATION') return res.status(400).json({ error: e.message });
    throw e;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const log = await client.query(
      `INSERT INTO logistics (max_participant) VALUES ($1) RETURNING logistics_id`,
      [maxP]
    );
    const logisticsId = log.rows[0].logistics_id;

    const result = await client.query(
      `INSERT INTO events (title, description, event_start_date, event_end_date, prize_pool, status_event_id, logistics_id)
       VALUES (
         $1,
         $2,
         CASE WHEN $3::text IS NULL OR TRIM(COALESCE($3::text, '')) = '' THEN NULL ELSE $3::date END,
         CASE WHEN $4::text IS NULL OR TRIM(COALESCE($4::text, '')) = '' THEN NULL ELSE $4::date END,
         $5,
         COALESCE(
           (SELECT status_event_id FROM status_events WHERE name = $6 LIMIT 1),
           (SELECT status_event_id FROM status_events WHERE name = 'เปิดรับสมัคร' LIMIT 1)
         ),
         $7
       )
       RETURNING event_id AS id, title`,
      [titleTrim, desc, dateIso, endIso, prize, statusName, logisticsId]
    );

    await client.query('COMMIT');
    res.json({ message: 'บันทึกสำเร็จ', data: result.rows[0] });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    console.error('เกิดข้อผิดพลาดในการบันทึก:', err.message);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.deleteActivity = async (req, res) => {
  const eventId = req.params.id;
  try {
    const r = await pool.query('DELETE FROM events WHERE event_id = $1 RETURNING event_id', [eventId]);
    if (r.rowCount === 0) {
      return res.status(404).json({ error: 'ไม่พบกิจกรรม' });
    }
    res.json({ message: 'ลบกิจกรรมสำเร็จ' });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการลบ:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getEventsList = async (req, res) => {
  try {
    const result = await pool.query('SELECT event_id, title FROM events ORDER BY event_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getAllActivities = async (req, res) => {
  try {
    const query = `
      SELECT
        e.event_id AS id,
        e.title,
        COALESCE(s.name, 'เปิดรับสมัคร') AS status,
        COALESCE(NULLIF(TRIM(e.description), ''), '') AS description,
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
        TO_CHAR(e.event_start_date, 'YYYY-MM-DD') AS date_input,
        COALESCE(TO_CHAR(e.event_end_date, 'DD/MM/YYYY'), '') AS end_date_text,
        TO_CHAR(e.event_end_date, 'YYYY-MM-DD') AS end_date_input,
        COALESCE(l.max_participant, 100) AS max_participants,
        (SELECT COUNT(*) FROM participant_profiles pp
         JOIN mapping_event_teams met ON pp.team_id = met.team_id
         WHERE met.event_id = e.event_id) AS current_participants,
        COALESCE(CAST(e.prize_pool AS TEXT), 'ไม่มีเงินรางวัล') AS prize_pool
      FROM events e
      LEFT JOIN status_events s ON e.status_event_id = s.status_event_id
      LEFT JOIN logistics l ON e.logistics_id = l.logistics_id
      ORDER BY e.event_id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('getActivities Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { title, status, date_text, end_date_text, description, max_participants, prize_pool } =
    req.body;

  const dateIso = parseEventDateInput(date_text);
  const endIso = parseEventDateInput(
    end_date_text != null && end_date_text !== '' ? end_date_text : req.body.end_date_input
  );
  try {
    validateEventDateRange(dateIso, endIso);
  } catch (e) {
    if (e.code === 'VALIDATION') return res.status(400).json({ error: e.message });
    throw e;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ev = await client.query(`SELECT logistics_id FROM events WHERE event_id = $1`, [id]);
    if (ev.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'ไม่พบกิจกรรม' });
    }

    let logisticsId = ev.rows[0].logistics_id;
    const maxP = parseMaxParticipants(max_participants);

    if (logisticsId != null) {
      await client.query(`UPDATE logistics SET max_participant = $1 WHERE logistics_id = $2`, [
        maxP,
        logisticsId,
      ]);
    } else {
      const ins = await client.query(
        `INSERT INTO logistics (max_participant) VALUES ($1) RETURNING logistics_id`,
        [maxP]
      );
      logisticsId = ins.rows[0].logistics_id;
      await client.query(`UPDATE events SET logistics_id = $1 WHERE event_id = $2`, [
        logisticsId,
        id,
      ]);
    }

    const prize = parsePrizePool(prize_pool);

    const statusName = String(status || 'เปิดรับสมัคร').trim();
    const desc =
      description != null && String(description).trim() !== '' ? String(description).trim() : null;

    await client.query(
      `
      UPDATE events
      SET
        title = $1,
        description = $2,
        status_event_id = COALESCE(
          (SELECT status_event_id FROM status_events WHERE name = $3 LIMIT 1),
          (SELECT status_event_id FROM status_events WHERE name = 'เปิดรับสมัคร' LIMIT 1)
        ),
        event_start_date = CASE WHEN $4::text IS NULL OR TRIM(COALESCE($4::text, '')) = '' THEN NULL ELSE $4::date END,
        event_end_date = CASE WHEN $5::text IS NULL OR TRIM(COALESCE($5::text, '')) = '' THEN NULL ELSE $5::date END,
        prize_pool = $6
      WHERE event_id = $7
    `,
      [String(title || '').trim(), desc, statusName, dateIso, endIso, prize, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'อัปเดตกิจกรรมสำเร็จ' });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    console.error('updateActivity Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
};
