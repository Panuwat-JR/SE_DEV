// ไฟล์: controllers/activityController.js
const pool = require('../config/db');

exports.createActivity = async (req, res) => {
  try {
    const { title, status, date_text, max_participants, prize_money } = req.body;
    const finalDate = date_text ? date_text : null;
    const result = await pool.query(
      `INSERT INTO Event (event_name, event_start_date, prize_money, status_event_id) 
       VALUES ($1, $2, $3, (SELECT status_event_id FROM Status_event WHERE name = 'เปิดรับสมัคร' LIMIT 1)) 
       RETURNING event_id AS id, event_name AS title`,
      [title, finalDate, prize_money]
    );
    res.json({ message: "บันทึกสำเร็จ", data: result.rows[0] });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการบันทึก:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteActivity = async (req, res) => {
  const eventId = req.params.id;
  try {
    await pool.query('DELETE FROM Task WHERE event_id = $1', [eventId]);
    await pool.query('DELETE FROM Team WHERE event_id = $1', [eventId]);
    await pool.query('DELETE FROM Document WHERE event_id = $1', [eventId]);
    await pool.query('DELETE FROM Event WHERE event_id = $1', [eventId]);
    res.json({ message: "ลบกิจกรรมสำเร็จ" });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการลบ:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getEventsList = async (req, res) => {
  try {
    const result = await pool.query('SELECT event_id, event_name FROM Event ORDER BY event_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};