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
        COALESCE(t.project_name, 'ไม่ระบุโครงการ') AS project_name,
        COALESCE(e.title, 'ไม่ระบุกิจกรรม') AS event,
        COALESCE(e.event_id, 0) AS event_id,
        (SELECT COUNT(*) FROM participant_profiles pp WHERE pp.team_id = t.team_id) AS "memberCount",
        0 AS "docsCount",
        '[]'::json AS members,
        'ยังไม่มีข้อมูลรายละเอียด' AS description
      FROM teams t
      LEFT JOIN mapping_event_teams met ON t.team_id = met.team_id
      LEFT JOIN events e ON met.event_id = e.event_id
      ORDER BY t.team_id ASC
    `;

    const teamsResult = await pool.query(teamsQuery);

    res.json(teamsResult.rows);
  } catch (err) {
    console.error('Error ดึงข้อมูลทีม:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, project_name, event_id } = req.body;
    const result = await pool.query(
      `INSERT INTO teams (name, project_name) VALUES ($1, $2) RETURNING team_id`,
      [name, project_name || null]
    );
    const teamId = result.rows[0].team_id;

    // Link team to event if provided
    if (event_id) {
      await pool.query(
        `INSERT INTO mapping_event_teams (event_id, team_id) VALUES ($1, $2)`,
        [parseInt(event_id, 10), teamId]
      );
    }

    res.json({ message: 'สร้างทีมสำเร็จ', data: { id: teamId } });
  } catch (err) {
    console.error('Error สร้างทีม:', err.message, err.stack);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};