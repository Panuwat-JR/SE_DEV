const pool = require('../config/db');

exports.getTeamsData = async (req, res) => {
  try {
    // 1. ดึงสถิติด้านบน (ใช้ชื่อตารางตามที่โชว์ใน pgAdmin ของพี่)
    const teamsCount = await pool.query('SELECT COUNT(*) FROM team');
    const membersCount = await pool.query('SELECT COUNT(*) FROM mapping_team_participant'); 
    const docsCount = await pool.query('SELECT COUNT(*) FROM document');

    const stats = [
      { id: 1, title: "ทีมทั้งหมด", value: teamsCount.rows[0].count, valueColor: "text-blue-600" },
      { id: 2, title: "สมาชิกรวม", value: membersCount.rows[0].count, valueColor: "text-emerald-600" },
      { id: 3, title: "โครงการ", value: "1", valueColor: "text-gray-900" }, // ใส่เลข 1 ไว้ก่อนเพราะตาราง event มีปัญหา
      { id: 4, title: "เอกสารทั้งหมด", value: docsCount.rows[0].count, valueColor: "text-gray-900" }
    ];

    // 2. Query ดึงข้อมูลการ์ดทีม (แก้ชื่อคอลัมน์และจุด Join)
    const teamsQuery = `
      SELECT 
        t.team_id AS id,
        t.team_name AS name,
        t.project_name AS project,
        (SELECT COUNT(*) FROM mapping_team_participant mtp WHERE mtp.team_id = t.team_id) AS "memberCount",
        (SELECT COUNT(*) FROM document d WHERE d.team_id = t.team_id) AS "docsCount",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'name', pp.first_name || ' ' || SUBSTRING(pp.last_name, 1, 1) || '.',
                'initial', SUBSTRING(pp.first_name, 1, 1),
                'isLeader', mtp.role = 'หัวหน้า'
              )
            )
            FROM mapping_team_participant mtp
            -- แก้จุดนี้: JOIN ไปที่ participant_profile และใช้ participant_profile_id
            JOIN participant_profile pp ON mtp.participant_profile_id = pp.participant_profile_id
            WHERE mtp.team_id = t.team_id
          ), '[]'::json
        ) AS members
      FROM team t
      ORDER BY t.team_id ASC;
    `;
    
    const teamsResult = await pool.query(teamsQuery);

    res.json({
      stats: stats,
      teamsData: teamsResult.rows
    });

  } catch (err) {
    console.error("Error ดึงข้อมูล:", err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};