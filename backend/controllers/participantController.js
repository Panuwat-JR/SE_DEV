const participantService = require('../services/participantService');
const fs = require('fs');
const path = require('path');

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

// ===== Documents (DB) =====
exports.listDocuments = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const docs = await participantService.listDocumentsForParticipant(participantName);
    res.json(docs);
  } catch (err) {
    console.error('List Documents Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const { project, name } = req.body || {};
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File is required' });
    if (!project) return res.status(400).json({ error: 'Project is required' });

    const doc = await participantService.createDocument({ participantName, file, project, name });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Upload Document Error:', err.message);
    // ถ้าสร้างไม่สำเร็จ ลบไฟล์ที่อัปโหลดทิ้ง
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    const code = err.message === 'Project not allowed' ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const docId = parseInt(req.params.id, 10);
    if (Number.isNaN(docId)) return res.status(400).json({ error: 'Invalid document id' });

    const result = await participantService.deleteDocument({ participantName, docId });
    if (!result.deleted) return res.status(404).json({ error: 'Document not found' });

    // ลบไฟล์จากดิสก์ถ้ามี
    if (result.path?.startsWith('/uploads/')) {
      const abs = path.join(__dirname, '..', result.path.replace(/^\/+/, ''));
      fs.unlink(abs, () => {});
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Delete Document Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// ===== Team members (DB) =====
exports.getTeam = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const team = await participantService.getTeamInfo(participantName);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    console.error('Get Team Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const { name, email, faculty, year } = req.body || {};
    const created = await participantService.addTeamMemberWithAccount({
      participantName,
      fullName: name,
      email,
      facultyName: faculty,
      yearOfStudy: year
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Add Team Member Error:', err.message);
    const code =
      err.message === 'Participant has no team' ? 400
        : err.message === 'Name is required' ? 400
          : err.message === 'Email is required' ? 400
            : 500;
    res.status(code).json({ error: err.message });
  }
};

exports.removeTeamMember = async (req, res) => {
  try {
    const participantName = 'ปิยะ'; // Demo user
    const memberId = req.params.id;
    const result = await participantService.removeTeamMember({ participantName, memberProfileId: memberId });
    if (!result.deleted) return res.status(404).json({ error: 'Member not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Remove Team Member Error:', err.message);
    const code =
      err.message === 'Participant has no team' ? 400
        : err.message === 'Invalid member id' ? 400
          : err.message === 'Cannot remove team leader' ? 403
            : 500;
    res.status(code).json({ error: err.message });
  }
};
