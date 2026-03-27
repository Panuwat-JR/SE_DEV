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

exports.getAllActivities = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.event_id AS id, 
        e.title, 
        COALESCE(s.name, 'เปิดรับสมัคร') AS status, 
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text, 
        COALESCE(e.max_participants, 100) AS max_participants,
        COALESCE(e.current_participants, 0) AS current_participants,
        COALESCE(CAST(e.prize_pool AS TEXT), 'ไม่มีเงินรางวัล') AS prize_pool
      FROM events e
      LEFT JOIN status_events s ON e.status_event_id = s.status_event_id
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
  try {
    const query = `
      UPDATE events
      SET 
        title = $1,
        status_event_id = (SELECT status_event_id FROM status_events WHERE name = $2 LIMIT 1),
        event_start_date = CASE WHEN $3 = '' THEN NULL ELSE $3::DATE END,
        max_participants = $4,
        prize_pool = $5
      WHERE event_id = $6
    `;
    await pool.query(query, [title, status, date_text || null, max_participants, prize_pool, id]);
    res.json({ message: 'อัปเดตกิจกรรมสำเร็จ' });
  } catch (err) {
    console.error('updateActivity Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};