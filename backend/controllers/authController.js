const participantService = require('../services/participantService');
const employeeService = require('../services/employeeService');
const { verifyPassword } = require('../utils/passwordVerify');

const ALLOWED_ROLES = ['participant', 'employee', 'executive'];

function isExecutivePortal(portalAccess) {
  return String(portalAccess || '').trim().toLowerCase() === 'executive';
}

function emailInExecutiveAllowlist(email) {
  const raw = process.env.EXECUTIVE_EMAILS || '';
  const set = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return set.includes(String(email || '').trim().toLowerCase());
}

function isExecutiveAccount(row) {
  return isExecutivePortal(row?.portal_access) || emailInExecutiveAllowlist(row?.email);
}

/**
 * POST /api/auth/login
 * ตรวจรหัสผ่าน (bcrypt) สำหรับพนักงาน/ผู้เข้าร่วม; แยกพอร์ทัล executive ตาม portal_access / EXECUTIVE_EMAILS
 */
exports.login = async (req, res) => {
  try {
    const { role, participantFirstname, password } = req.body || {};
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
    }

    const passwordPlain = password != null ? String(password) : '';

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
      const authRow = await participantService.getParticipantAuthByFirstname(name);
      const hash = authRow?.password_hash;
      const relax =
        process.env.NU_SEED_RELAX_PARTICIPANT_AUTH === '1' && process.env.NODE_ENV !== 'production';
      if (!relax && !passwordPlain) {
        return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
      }
      if (passwordPlain || !relax) {
        if (!verifyPassword(passwordPlain, hash)) {
          return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
        }
      }
      return res.json({
        ok: true,
        role,
        participantFirstname: name,
        profile,
      });
    }

    if (role === 'employee' || role === 'executive') {
      const employeeEmail = String(req.body?.employeeEmail ?? '').trim().toLowerCase();
      if (!employeeEmail) {
        return res.status(400).json({ error: 'กรุณาระบุอีเมลพนักงาน (ต้องตรงกับ employees.email ในฐานข้อมูล)' });
      }
      if (!passwordPlain) {
        return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
      }

      const row = await employeeService.getEmployeeForLogin(employeeEmail);
      if (!row) {
        return res.status(404).json({
          error: 'ไม่พบพนักงานในระบบ — ตรวจสอบอีเมลหรือรัน employee_seed / init-demo-db',
        });
      }

      if (!verifyPassword(passwordPlain, row.password_hash)) {
        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
      }

      const execAcct = isExecutiveAccount(row);
      if (role === 'executive' && !execAcct) {
        return res.status(403).json({
          error: 'บัญชีนี้ไม่มีสิทธิ์ผู้บริหาร — เลือก "ผู้รับผิดชอบโครงการ" หรือใช้บัญชีที่ได้รับมอบหมาย (เช่น exec@demo.nu.seed, kanda@se.dev)',
        });
      }
      if (role === 'employee' && execAcct) {
        return res.status(403).json({
          error: 'บัญชีผู้บริหารต้องเลือกเมนู "ผู้บริหาร" เมื่อเข้าสู่ระบบ',
        });
      }

      const employee = {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role,
        department: row.department,
        initial: row.initial,
      };
      return res.json({ ok: true, role, employee });
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
