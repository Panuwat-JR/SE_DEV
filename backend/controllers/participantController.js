const participantService = require('../services/participantService');
const fs = require('fs');
const path = require('path');

/** ถอดรหัสชื่อจาก header (ส่งมาแบบ encodeURIComponent) หรือ query — ถ้าไม่ใช่รูปแบบ encode ก็คืนตามเดิม */
function decodeParticipantToken(raw) {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** ระบุตัวผู้เข้าร่วม: header X-Participant-Firstname → query ?as= → env DEMO_PARTICIPANT_FIRSTNAME */
function participantFromRequest(req) {
  const h = typeof req.get === 'function' ? req.get('x-participant-firstname') : req.headers['x-participant-firstname'];
  const fromHeader = h != null ? decodeParticipantToken(String(h).trim()) : '';
  const qRaw = req.query?.as != null ? String(req.query.as).trim() : '';
  const fromQuery = qRaw ? decodeParticipantToken(qRaw) : '';
  const raw = fromHeader || fromQuery;
  if (raw) return raw;
  return participantService.getDemoParticipantFirstname();
}

exports.getProfile = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    const profile = await participantService.getProfileForParticipant(participantName);
    if (!profile) {
      return res.status(404).json({
        error: 'ไม่พบผู้เข้าร่วมในฐานข้อมูล — ตรวจสอบชื่อ (firstname) ให้ตรงกับ participant_profiles',
      });
    }
    res.json(profile);
  } catch (err) {
    console.error('Participant profile:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getParticipantDashboardData = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    
    // 1. Get raw projects
    const projects = await participantService.getProjectList(participantName);

    // 2. Enrich with task stats
    const enrichedProjects = await Promise.all(projects.map(async (proj) => {
      const tasksSummary = await participantService.getTaskSummary(proj.id);
      const nextTask = await participantService.getNextTask(proj.id);

      const total = parseInt(tasksSummary.total) || 0;
      const done = parseInt(tasksSummary.done) || 0;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      const progressColor =
        progress >= 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300';

      return {
        ...proj,
        progress,
        progressColor,
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
    const participantName = participantFromRequest(req);

    const project = await participantService.getProjectDetail(id, participantName);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await participantService.getAllTasks(id);

    // Simulated Timeline
    const timeline = [
      { phase: 'เปิดรับสมัคร', start: '1 ม.ค. 2569', end: project.start_date, done: true },
      { phase: 'รอดำเนินการ', start: project.start_date, end: project.end_date, done: false, current: true },
      { phase: 'ประกาศผล', start: project.end_date, end: project.end_date, done: false },
    ];

    const documentCount = Number(project.documentCount) || 0;

    res.json({ ...project, documentCount, tasks, timeline });
  } catch (err) {
    console.error('Project Detail Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// ===== Documents (DB) =====
exports.listDocuments = async (req, res) => {
  try {
    const docs = await participantService.listDocumentsForParticipant(participantFromRequest(req));
    res.json(docs);
  } catch (err) {
    console.error('List Documents Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const rows = await participantService.getDocumentsForParticipant(participantFromRequest(req));
    res.json(rows);
  } catch (err) {
    console.error('Participant documents:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    const { project, name } = req.body || {};
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'File is required' });
    if (!project) return res.status(400).json({ error: 'Project is required' });

    const doc = await participantService.createDocument({ participantName, file, project, name });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Upload Document Error:', err.message);
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    const code = err.message === 'Project not allowed' ? 403 : 500;
    res.status(code).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    const docId = parseInt(req.params.id, 10);
    if (Number.isNaN(docId)) return res.status(400).json({ error: 'Invalid document id' });

    const result = await participantService.deleteDocument({ participantName, docId });
    if (!result.deleted) return res.status(404).json({ error: 'Document not found' });

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

exports.createDocument = async (req, res) => {
  try {
    const { name, eventId, fileName, fileSize } = req.body || {};
    const eid = Number(eventId);
    if (!eid || Number.isNaN(eid)) {
      return res.status(400).json({ error: 'ต้องระบุโครงการ (eventId)' });
    }
    const doc = await participantService.createParticipantDocument(participantFromRequest(req), {
      name,
      eventId: eid,
      fileName,
      fileSize,
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err.code === 'FORBIDDEN_EVENT') {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์อัปโหลดในโครงการนี้' });
    }
    if (err.code === 'NO_TASKS_FOR_EVENT') {
      return res.status(400).json({
        error: 'โครงการนี้ยังไม่มีงานในระบบ — ต้องมีงานอย่างน้อย 1 รายการจึงจะผูกเอกสารได้',
      });
    }
    console.error('Create participant document:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getTeam = async (req, res) => {
  try {
    const team = await participantService.getTeamForParticipant(participantFromRequest(req));
    if (!team) return res.json(null);
    res.json(team);
  } catch (err) {
    console.error('Participant team:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const items = await participantService.getNotificationsForParticipant(participantFromRequest(req));
    res.json(items);
  } catch (err) {
    console.error('Participant notifications:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const rows = await participantService.getContactsForParticipant(participantFromRequest(req));
    res.json(rows);
  } catch (err) {
    console.error('Participant contacts:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.postContactMessage = async (req, res) => {
  try {
    const { employeeId, subject, body } = req.body || {};
    if (!body || !String(body).trim()) {
      return res.status(400).json({ error: 'กรุณากรอกข้อความ' });
    }
    await participantService.saveContactMessage(participantFromRequest(req), {
      employeeId: employeeId != null ? Number(employeeId) : null,
      subject,
      body: String(body).trim(),
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === '42P01') {
      return res.status(503).json({
        error: 'ตารางข้อความยังไม่พร้อม — รัน backend/migrations/2026-03-27_participant_contact_messages.sql',
      });
    }
    console.error('Contact message:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const events = await participantService.getCalendarForParticipant(participantFromRequest(req));
    res.json(events);
  } catch (err) {
    console.error('Participant calendar:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    const { name, email, faculty, year } = req.body || {};
    const created = await participantService.addTeamMemberWithAccount({
      participantName,
      fullName: name,
      email,
      facultyName: faculty,
      yearOfStudy: year,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error('Add Team Member Error:', err.message);
    const code =
      err.message === 'Participant has no team'
        ? 400
        : err.message === 'Name is required'
          ? 400
          : err.message === 'Email is required'
            ? 400
            : 500;
    res.status(code).json({ error: err.message });
  }
};

exports.removeTeamMember = async (req, res) => {
  try {
    const participantName = participantFromRequest(req);
    const memberId = req.params.id;
    const result = await participantService.removeTeamMember({ participantName, memberProfileId: memberId });
    if (!result.deleted) return res.status(404).json({ error: 'Member not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Remove Team Member Error:', err.message);
    const code =
      err.message === 'Participant has no team'
        ? 400
        : err.message === 'Invalid member id'
          ? 400
          : err.message === 'Cannot remove team leader'
            ? 403
            : 500;
    res.status(code).json({ error: err.message });
  }
};

exports.listFeedbacks = async (req, res) => {
  try {
    const rows = await participantService.listFeedbacksForParticipant(participantFromRequest(req));
    res.json(rows);
  } catch (err) {
    console.error('Participant feedbacks:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { rating, comment, aspects, projectTitle } = req.body || {};
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ error: 'คะแนนไม่ถูกต้อง' });
    }
    await participantService.createFeedbackForParticipant(participantFromRequest(req), {
      rating: r,
      comment: comment != null ? String(comment) : '',
      aspects: aspects && typeof aspects === 'object' ? aspects : {},
      projectTitle: projectTitle != null ? String(projectTitle) : '',
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 'PARTICIPANT_NOT_FOUND') {
      return res.status(404).json({ error: 'ไม่พบบัญชีผู้เข้าร่วมในระบบ (seed ผู้ใช้ก่อน)' });
    }
    if (err.code === 'PROJECT_NOT_FOUND') {
      return res.status(400).json({ error: 'โครงการที่เลือกไม่พบในระบบ หรือคุณไม่ได้เข้าร่วมโครงการนี้' });
    }
    console.error('Create feedback:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
