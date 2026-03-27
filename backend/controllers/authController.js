const participantService = require('../services/participantService');

const ALLOWED_ROLES = ['participant', 'employee', 'executive'];

/**
 * POST /api/auth/login
 * Demo: ไม่มีรหัสผ่าน — ตรวจบทบาท และถ้าเป็นผู้เข้าร่วมให้ยืนยันว่ามี firstname ในฐานข้อมูล
 */
exports.login = async (req, res) => {
  try {
    const { role, participantFirstname } = req.body || {};
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
    }

    if (role === 'participant') {
      const name = String(participantFirstname ?? '').trim();
      if (!name) {
        return res.status(400).json({ error: 'กรุณาระบุชื่อผู้เข้าร่วม (firstname)' });
      }
      const profile = await participantService.getProfileForParticipant(name);
      if (!profile) {
        return res.status(404).json({
          error: 'ไม่พบผู้เข้าร่วมในฐานข้อมูล — ตรวจสอบ firstname ให้ตรง participant_profiles',
        });
      }
      return res.json({
        ok: true,
        role,
        participantFirstname: name,
        profile,
      });
    }

    return res.json({ ok: true, role });
  } catch (err) {
    console.error('Auth login:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * GET /api/auth/session?role=employee
 * GET /api/auth/session?role=participant&as=ชื่อ
 * ใช้ยืนยันหลังรีเฟรชว่าบทบาท / ผู้เข้าร่วมยังใช้ได้ (optional — client อาจพึ่ง localStorage อย่างเดียว)
 */
exports.session = async (req, res) => {
  try {
    const role = String(req.query.role || '').trim();
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'ระบุ role ไม่ถูกต้อง' });
    }

    if (role === 'participant') {
      const q = req.query.as != null ? String(req.query.as).trim() : '';
      if (!q) {
        return res.status(400).json({ error: 'ผู้เข้าร่วมต้องระบุ as=firstname' });
      }
      let decoded = q;
      try {
        decoded = decodeURIComponent(q);
      } catch {
        /* use raw */
      }
      const profile = await participantService.getProfileForParticipant(decoded);
      if (!profile) {
        return res.status(404).json({ error: 'ไม่พบผู้เข้าร่วม' });
      }
      return res.json({ ok: true, role, participantFirstname: decoded, profile });
    }

    return res.json({ ok: true, role });
  } catch (err) {
    console.error('Auth session:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
