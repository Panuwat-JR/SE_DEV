// ตารางตาม se.sql — ดึงทีม สมาชิก กิจกรรม และเอกสาร (team_docs) ให้ตรงกับ UI ผู้บริหาร
const pool = require('../config/db');

const MEMBER_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-cyan-600',
];

function parseIntSafe(v) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
}

/** หัวหน้าทีม = คนที่มีบัญชี participants และ profile_id น้อยสุด; ถ้าไม่มีใครมีบัญชี = profile_id น้อยสุดในทีม */
function attachMembers(teamRows, memberRows) {
  const byTeam = new Map();
  for (const r of memberRows) {
    const tid = r.team_id;
    if (!byTeam.has(tid)) byTeam.set(tid, []);
    byTeam.get(tid).push(r);
  }

  return teamRows.map((t) => {
    const list = byTeam.get(t.id) || [];
    const withAccount = list.filter((m) => m.has_account);
    const leaderId =
      withAccount.length > 0
        ? Math.min(...withAccount.map((m) => m.id))
        : list.length > 0
          ? Math.min(...list.map((m) => m.id))
          : null;

    const members = list.map((m, i) => ({
      name: m.name?.trim() || 'ไม่ระบุชื่อ',
      initial: (m.initial || '?').toString().charAt(0).toUpperCase(),
      isLeader: leaderId != null && m.id === leaderId,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
      email: m.email || '',
    }));

    return {
      ...t,
      memberCount: parseIntSafe(t.memberCount),
      docsCount: parseIntSafe(t.docsCount),
      eventCount: parseIntSafe(t.eventCount),
      event_id: t.event_id != null ? parseIntSafe(t.event_id) : null,
      members,
    };
  });
}

exports.getTeamsData = async (req, res) => {
  try {
    const [teamsCount, docsCount, eventsCount, memberTotal] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS c FROM teams'),
      pool.query('SELECT COUNT(*)::int AS c FROM documents'),
      pool.query('SELECT COUNT(*)::int AS c FROM events'),
      pool.query(
        'SELECT COUNT(*)::int AS c FROM participant_profiles WHERE team_id IS NOT NULL'
      ),
    ]);

    const stats = [
      { id: 1, title: 'ทีมทั้งหมด', value: String(teamsCount.rows[0].c), valueColor: 'text-blue-600' },
      {
        id: 2,
        title: 'สมาชิกรวม',
        value: String(memberTotal.rows[0].c),
        valueColor: 'text-emerald-600',
      },
      { id: 3, title: 'โครงการ', value: String(eventsCount.rows[0].c), valueColor: 'text-gray-900' },
      { id: 4, title: 'เอกสารทั้งหมด', value: String(docsCount.rows[0].c), valueColor: 'text-gray-900' },
    ];

    const teamsSql = `
      SELECT
        t.team_id AS id,
        t.name,
        COALESCE(NULLIF(TRIM(t.project_name), ''), 'ไม่ระบุโครงการ') AS project_name,
        ev.primary_event_title AS event,
        ev.primary_event_id AS event_id,
        (SELECT COUNT(*)::int FROM participant_profiles pp WHERE pp.team_id = t.team_id) AS "memberCount",
        (SELECT COUNT(*)::int FROM mapping_event_teams m0 WHERE m0.team_id = t.team_id) AS "eventCount",
        (
          SELECT COUNT(*)::int FROM team_docs td
          WHERE td.event_name IN (
            SELECT e2.title
            FROM mapping_event_teams m2
            JOIN events e2 ON e2.event_id = m2.event_id
            WHERE m2.team_id = t.team_id
          )
        ) AS "docsCount"
      FROM teams t
      LEFT JOIN LATERAL (
        SELECT e.title AS primary_event_title, e.event_id AS primary_event_id
        FROM mapping_event_teams met
        JOIN events e ON e.event_id = met.event_id
        WHERE met.team_id = t.team_id
        ORDER BY e.event_id ASC
        LIMIT 1
      ) ev ON true
      ORDER BY t.team_id ASC
    `;

    const membersSql = `
      SELECT
        pp.team_id,
        pp.participant_profile_id AS id,
        TRIM(BOTH FROM CONCAT(COALESCE(pp.firstname, ''), ' ', COALESCE(pp.lastname, ''))) AS name,
        UPPER(SUBSTRING(COALESCE(NULLIF(TRIM(pp.firstname), ''), '?') FROM 1 FOR 1)) AS initial,
        COALESCE(p.email, '') AS email,
        EXISTS (
          SELECT 1 FROM participants p2 WHERE p2.participant_profile_id = pp.participant_profile_id
        ) AS has_account
      FROM participant_profiles pp
      LEFT JOIN participants p ON p.participant_profile_id = pp.participant_profile_id
      WHERE pp.team_id IN (SELECT team_id FROM teams)
      ORDER BY pp.team_id ASC, pp.participant_profile_id ASC
    `;

    const [teamsResult, membersResult] = await Promise.all([
      pool.query(teamsSql),
      pool.query(membersSql),
    ]);

    const teamsData = attachMembers(teamsResult.rows, membersResult.rows);

    res.json({ stats, teamsData });
  } catch (err) {
    console.error('Error ดึงข้อมูลทีม:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};

exports.createTeam = async (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const project_name = String(req.body?.project_name ?? '').trim();
  const event_id_raw = req.body?.event_id;
  const event_id =
    event_id_raw === '' || event_id_raw === null || event_id_raw === undefined
      ? null
      : parseInt(event_id_raw, 10);

  if (!name) {
    return res.status(400).json({ error: 'ชื่อทีมจำเป็น' });
  }
  if (event_id != null && Number.isNaN(event_id)) {
    return res.status(400).json({ error: 'รหัสกิจกรรมไม่ถูกต้อง' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ins = await client.query(
      `INSERT INTO teams (name, project_name)
       VALUES ($1, $2)
       RETURNING team_id AS id, name, project_name`,
      [name, project_name || null]
    );
    const row = ins.rows[0];
    const teamId = row.id;

    if (event_id != null) {
      const ev = await client.query('SELECT 1 FROM events WHERE event_id = $1', [event_id]);
      if (ev.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'ไม่พบกิจกรรมที่เลือก' });
      }
      await client.query(
        `INSERT INTO mapping_event_teams (event_id, team_id) VALUES ($1, $2)
         ON CONFLICT (event_id, team_id) DO NOTHING`,
        [event_id, teamId]
      );
    }

    await client.query('COMMIT');

    const [singleTeam] = attachMembers(
      [
        {
          id: teamId,
          name: row.name,
          project_name: row.project_name || 'ไม่ระบุโครงการ',
          event: null,
          event_id: event_id,
          memberCount: 0,
          eventCount: event_id != null ? 1 : 0,
          docsCount: 0,
        },
      ],
      []
    );

    if (event_id != null) {
      const evRow = await pool.query(`SELECT title FROM events WHERE event_id = $1`, [event_id]);
      singleTeam.event = evRow.rows[0]?.title || null;
    }

    res.status(201).json({ message: 'สร้างทีมสำเร็จ', team: singleTeam });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    console.error('createTeam:', err.message);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  } finally {
    client.release();
  }
};
