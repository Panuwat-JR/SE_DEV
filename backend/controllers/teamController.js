// ไฟล์: controllers/teamController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
// หมายเหตุ: ใน se.sql ไม่มี mapping_team_participant และ document.team_id
// จึงดึงเฉพาะข้อมูลที่มีจริงใน schema
const pool = require('../config/db');

exports.getTeamsData = async (req, res) => {
  try {
    const teamsCount = await pool.query('SELECT COUNT(*) FROM teams');
    const docsCount = await pool.query('SELECT COUNT(*) FROM documents');
    const eventsCount = await pool.query('SELECT COUNT(*) FROM events');

    const stats = [
      { id: 1, title: 'ทีมทั้งหมด', value: teamsCount.rows[0].count, valueColor: 'text-blue-600' },
      { id: 2, title: 'สมาชิกรวม', value: '0', valueColor: 'text-emerald-600' },
      { id: 3, title: 'โครงการ', value: eventsCount.rows[0].count, valueColor: 'text-gray-900' },
      { id: 4, title: 'เอกสารทั้งหมด', value: docsCount.rows[0].count, valueColor: 'text-gray-900' }
    ];

    const teamsQuery = `
      SELECT
        t.team_id AS id,
        t.name AS name,
        COALESCE(t.project_name, 'ไม่ระบุโครงการ') AS project,
        0 AS "memberCount",
        0 AS "docsCount",
        '[]'::json AS members
      FROM teams t
      ORDER BY t.team_id ASC
    `;

    const teamsResult = await pool.query(teamsQuery);

    res.json({
      stats,
      teamsData: teamsResult.rows
    });
  } catch (err) {
    console.error('Error ดึงข้อมูล:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};