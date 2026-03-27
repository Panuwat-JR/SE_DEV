const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ดึงข้อมูล Dashboard ของนิสิต
router.get('/dashboard', participantController.getParticipantDashboardData);

// ดึงรายละเอียดโครงการที่นิสิตเข้าร่วม (แยกตาม ID)
router.get('/projects/:id', participantController.getProjectDetail);

// Team (DB)
router.get('/team', participantController.getTeam);
router.post('/team/members', participantController.addTeamMember);
router.delete('/team/members/:id', participantController.removeTeamMember);

// ===== Documents (DB) =====
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = path.basename(file.originalname).replace(/[^\w.\-() ]+/g, '_');
    const stamp = Date.now();
    cb(null, `${stamp}-${safeBase}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

router.get('/documents', participantController.listDocuments);
router.post('/documents', upload.single('file'), participantController.uploadDocument);
router.delete('/documents/:id', participantController.deleteDocument);

module.exports = router;
