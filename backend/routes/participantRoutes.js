const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// โปรไฟล์ผู้เข้าร่วม (ซิงค์ UI กับ DB)
router.get('/profile', participantController.getProfile);

// ดึงข้อมูล Dashboard ของนิสิต
router.get('/dashboard', participantController.getParticipantDashboardData);

// ดึงรายละเอียดโครงการที่นิสิตเข้าร่วม (แยกตาม ID)
router.get('/projects/:id', participantController.getProjectDetail);

// Team
router.get('/team', participantController.getTeam);
router.post('/team/members', participantController.addTeamMember);
router.delete('/team/members/:id', participantController.removeTeamMember);

// ===== Documents (DB) =====
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // path.basename กัน path traversal, replace กัน special chars, slice กันชื่อยาวเกิน
    const safeBase = path.basename(file.originalname)
      .replace(/[^\w.\-() ]+/g, '_')
      .slice(0, 100);
    const stamp = Date.now();
    cb(null, `${stamp}-${safeBase}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.get('/documents', participantController.getDocuments);

router.post('/documents', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    return upload.single('file')(req, res, (err) => {
      if (err) return next(err);
      return participantController.uploadDocument(req, res, next);
    });
  }
  return participantController.createDocument(req, res, next);
});

router.delete('/documents/:id', participantController.deleteDocument);

router.get('/notifications', participantController.getNotifications);
router.get('/contacts', participantController.getContacts);
router.post('/contact-messages', participantController.postContactMessage);
router.get('/calendar', participantController.getCalendar);
router.get('/feedbacks', participantController.listFeedbacks);
router.post('/feedbacks', participantController.createFeedback);

module.exports = router;
