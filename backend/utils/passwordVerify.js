const bcrypt = require('bcryptjs');

/**
 * ตรวจรหัสผ่านกับ hash ในฐานข้อมูล
 * - bcrypt ($2a/$2b) ใช้ bcrypt.compare
 * - hash เดโมแบบสั้น/placeholder รับเฉพาะ password123
 */
function verifyPassword(plain, hash) {
  const p = String(plain ?? '');
  const h = String(hash ?? '');
  if (!h) {
    return process.env.NU_SEED_RELAX_PARTICIPANT_AUTH === '1' && process.env.NODE_ENV !== 'production';
  }
  if (h.length >= 20 && (h.startsWith('$2a$') || h.startsWith('$2b$'))) {
    try {
      return bcrypt.compareSync(p, h);
    } catch {
      return false;
    }
  }
  return p === 'password123';
}

module.exports = { verifyPassword };
