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