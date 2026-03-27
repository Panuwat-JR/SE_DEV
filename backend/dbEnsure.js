/**
 * รัน DDL แบบ idempotent ตอนสตาร์ทเซิร์ฟเวอร์ — ลดโอกาสพลาด migration เมื่อรัน backend อย่างเดียว
 */
const fs = require('fs');
const path = require('path');

const MIGRATION_FILES = [
  '2026-03-27_participant_contact_messages.sql',
  '2026-03-28_participant_notification_reads.sql',
];

async function ensureDb(pool) {
  await pool.query(`
    ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS portal_access VARCHAR(32) NOT NULL DEFAULT 'employee'
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  for (const name of MIGRATION_FILES) {
    const filePath = path.join(migrationsDir, name);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  dbEnsure: ไม่พบไฟล์ migration ${name}`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
  }
}

module.exports = { ensureDb };
