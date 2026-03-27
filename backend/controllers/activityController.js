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

exports.createActivity = async (req, res) => {
  const { title, status, date_text, max_participants, prize_pool } = req.body;
  const titleTrim = String(title || '').trim();
  if (!titleTrim) {
    return res.status(400).json({ error: 'ต้องระบุชื่อกิจกรรม' });
  }

  const statusName = String(status || 'เปิดรับสมัคร').trim();
  const dateIso = parseEventDateInput(date_text);
  const maxP = parseMaxParticipants(max_participants);
  const prize = parsePrizePool(prize_pool);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const log = await client.query(
      `INSERT INTO logistics (max_participant) VALUES ($1) RETURNING logistics_id`,
      [maxP]
    );
    const logisticsId = log.rows[0].logistics_id;

    const result = await client.query(
      `INSERT INTO events (title, event_start_date, prize_pool, status_event_id, logistics_id)
       VALUES (
         $1,
         $2::date,
         $3,
         COALESCE(
           (SELECT status_event_id FROM status_events WHERE name = $4 LIMIT 1),
           (SELECT status_event_id FROM status_events WHERE name = 'เปิดรับสมัคร' LIMIT 1)
         ),
         $5
       )
       RETURNING event_id AS id, title`,
      [titleTrim, dateIso, prize, statusName, logisticsId]
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
    await pool.query('DELETE FROM events WHERE event_id = $1', [eventId]);
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
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
        TO_CHAR(e.event_start_date, 'YYYY-MM-DD') AS date_input,
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
  const { title, status, date_text, max_participants, prize_pool } = req.body;

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

    const dateIso = parseEventDateInput(date_text);
    const prize = parsePrizePool(prize_pool);

    const statusName = String(status || 'เปิดรับสมัคร').trim();

    await client.query(
      `
      UPDATE events
      SET
        title = $1,
        status_event_id = COALESCE(
          (SELECT status_event_id FROM status_events WHERE name = $2 LIMIT 1),
          (SELECT status_event_id FROM status_events WHERE name = 'เปิดรับสมัคร' LIMIT 1)
        ),
        event_start_date = CASE WHEN $3::text IS NULL OR $3::text = '' THEN NULL ELSE $3::date END,
        prize_pool = $4
      WHERE event_id = $5
    `,
      [String(title || '').trim(), statusName, dateIso, prize, id]
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
