// ไฟล์: controllers/activityController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
const pool = require('../config/db');

exports.createActivity = async (req, res) => {
  try {
    const { title, status, date_text, max_participants, prize_pool } = req.body;
    const finalDate = date_text ? date_text : null;
    const result = await pool.query(
      `INSERT INTO events (title, event_start_date, prize_pool, status_event_id)
       VALUES ($1, $2, $3, (SELECT status_event_id FROM status_events WHERE name = 'เปิดรับสมัคร' LIMIT 1))
       RETURNING event_id AS id, title`,
      [title, finalDate, prize_pool || null]
    );
    res.json({ message: 'บันทึกสำเร็จ', data: result.rows[0] });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึก:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getAllActivities = async (req, res) => {
  try {
    const query = `
      SELECT
        e.event_id AS id,
        e.title,
        COALESCE(se.name, 'เปิดรับสมัคร') AS status,
        TO_CHAR(e.event_start_date, 'DD/MM/YYYY') AS date_text,
        (
          SELECT COUNT(*)
          FROM mapping_event_teams met
          JOIN participant_profiles pp ON met.team_id = pp.team_id
          WHERE met.event_id = e.event_id
        ) AS current_participants,
        COALESCE(l.max_participant, 0) AS max_participants,
        CASE WHEN e.prize_pool > 0 THEN CAST(e.prize_pool AS INTEGER)::text || ' บาท' ELSE 'ไม่มีเงินรางวัล' END AS prize_pool,
        e.description,
        TO_CHAR(e.registration_start_date, 'YYYY-MM-DD') AS registration_start,
        TO_CHAR(e.registration_end_date, 'YYYY-MM-DD') AS registration_end,
        TO_CHAR(e.event_start_date, 'YYYY-MM-DD') AS event_start,
        TO_CHAR(e.event_end_date, 'YYYY-MM-DD') AS event_end,
        COALESCE(o.name, 'ไม่ระบุผู้จัด') AS organizer,
        COALESCE(et.name, 'ไม่มีประเภท') AS type,
        COALESCE(ec.name, 'ไม่มีหมวดหมู่') AS category,
        COALESCE(l.format, 'TBA') AS format,
        COALESCE(l.location, 'TBA') AS location
      FROM events e
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      LEFT JOIN logistics l ON e.logistics_id = l.logistics_id
      LEFT JOIN organizers o ON e.organizer_id = o.organizer_id
      LEFT JOIN event_types et ON e.event_type_id = et.event_type_id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.event_category_id
      ORDER BY e.event_id DESC
    `;
    const result = await pool.query(query);
    // Parse numeric fields properly just in case
    const rows = result.rows.map(row => ({
      ...row,
      current_participants: parseInt(row.current_participants, 10),
      max_participants: parseInt(row.max_participants, 10)
    }));
    res.json(rows);
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงกิจกรรมทั้งหมด:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteActivity = async (req, res) => {
  const eventId = req.params.id;
  try {
    // tasks มี ON DELETE CASCADE จาก events แล้ว
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