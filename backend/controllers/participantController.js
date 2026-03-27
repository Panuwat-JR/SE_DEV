const participantService = require('../services/participantService');

exports.getParticipantDashboardData = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    
    // 1. Get raw projects
    const projects = await participantService.getProjectList(participantName);

    // 2. Enrich with task stats
    const enrichedProjects = await Promise.all(projects.map(async (proj) => {
      const tasksSummary = await participantService.getTaskSummary(proj.id);
      const nextTask = await participantService.getNextTask(proj.id);

      const total = parseInt(tasksSummary.total) || 0;
      const done = parseInt(tasksSummary.done) || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        ...proj,
        progress,
        doneItems: done,
        totalItems: total,
        nextTask: nextTask?.task_name || '—',
        nextDeadline: nextTask?.deadline || '—'
      };
    }));

    res.json(enrichedProjects);
  } catch (err) {
    console.error('Participant Dashboard Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const participantName = 'ปิยะ';

    const project = await participantService.getProjectDetail(id, participantName);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await participantService.getAllTasks(id);

    // Simulated Timeline
    const timeline = [
      { phase: 'เปิดรับสมัคร', start: '1 ม.ค. 2569', end: project.start_date, done: true },
      { phase: 'รอดำเนินการ', start: project.start_date, end: project.end_date, done: false, current: true },
      { phase: 'ประกาศผล', start: project.end_date, end: project.end_date, done: false },
    ];

    res.json({ ...project, tasks, timeline });
  } catch (err) {
    console.error('Project Detail Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

const pool = require('../config/db');

exports.getParticipants = async (req, res) => {
  try {
    const query = `
      SELECT
        p.participant_id AS id,
        pp.firstname,
        pp.lastname,
        t.team_id AS team_id,
        COALESCE(t.name, 'ไม่ระบุทีม') AS team_name,
        COALESCE(f.name, 'ไม่ระบุคณะ') AS faculty,
        COALESCE(m.name, 'ไม่ระบุสาขา') AS major,
        pp.student_id,
        pp.year_of_study,
        pp.phone_number AS phone,
        p.email,
        COALESCE(pt.name, 'ผู้เข้าร่วมทั่วไป') AS type
      FROM participants p
      JOIN participant_profiles pp ON p.participant_profile_id = pp.participant_profile_id
      LEFT JOIN teams t ON pp.team_id = t.team_id
      LEFT JOIN faculties f ON pp.faculty_id = f.faculty_id
      LEFT JOIN majors m ON pp.major_id = m.major_id
      LEFT JOIN participant_types pt ON pp.participant_type_id = pt.participant_type_id
      ORDER BY p.participant_id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Participant List Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getFaculties = async (req, res) => {
  try {
    const result = await pool.query('SELECT faculty_id, name FROM faculties ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Faculties Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getMajors = async (req, res) => {
  try {
    const result = await pool.query('SELECT major_id, faculty_id, name FROM majors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Majors Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createParticipant = async (req, res) => {
  try {
    const { firstname, lastname, faculty_id, major_id, student_id, year_of_study, phone, email, team_id } = req.body;

    // 1. Insert participant_profile
    const profileResult = await pool.query(
      `INSERT INTO participant_profiles (firstname, lastname, faculty_id, major_id, student_id, year_of_study, phone_number, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING participant_profile_id`,
      [
        firstname, lastname,
        faculty_id ? parseInt(faculty_id) : null,
        major_id ? parseInt(major_id) : null,
        student_id || null,
        year_of_study ? parseInt(year_of_study) : null,
        phone || null,
        team_id ? parseInt(team_id) : null
      ]
    );
    const profileId = profileResult.rows[0].participant_profile_id;

    // 2. Insert participant (login account)
    await pool.query(
      `INSERT INTO participants (participant_profile_id, email, password_hash, status)
       VALUES ($1, $2, $3, 'active')`,
      [profileId, email || `user_${profileId}@placeholder.com`, 'pending_setup']
    );

    res.json({ message: 'เพิ่มผู้เข้าร่วมสำเร็จ' });
  } catch (err) {
    console.error('Create Participant Error:', err.message, err.stack);
    res.status(500).json({ error: 'Server Error: ' + err.message });
  }
};
