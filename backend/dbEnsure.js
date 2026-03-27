/**
 * รัน DDL แบบ idempotent ตอนสตาร์ทเซิร์ฟเวอร์ — ลดโอกาสพลาด migration เมื่อรัน backend อย่างเดียว
 */
const fs = require('fs');
const path = require('path');

const MIGRATION_FILES = [
  '2026-03-27_participant_contact_messages.sql',
  '2026-03-28_participant_notification_reads.sql',
  '2026-03-28_events_committee_members.sql',
];

async function ensureDb(pool) {
  await pool.query(`
    ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS portal_access VARCHAR(32) NOT NULL DEFAULT 'employee'
  `);

  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS committee_members TEXT
  `);

  // เพิ่มสถานะโครงการที่ขาดหายใน status_events (ON CONFLICT ป้องกันซ้ำ)
  await pool.query(`
    INSERT INTO status_events (name, slug) VALUES
      ('เปิดรับสมัคร', 'open_registration'),
      ('ปิดรับสมัคร', 'closed_registration'),
      ('ประกาศผล', 'announced'),
      ('ยกเลิก', 'cancelled')
    ON CONFLICT (name) DO NOTHING
  `).catch(async () => {
    // ถ้า status_events ไม่มี unique constraint บน name ให้ fallback แทรกทีละรายการ
    for (const [name, slug] of [
      ['เปิดรับสมัคร', 'open_registration'],
      ['ปิดรับสมัคร', 'closed_registration'],
      ['ประกาศผล', 'announced'],
      ['ยกเลิก', 'cancelled'],
    ]) {
      const exists = await pool.query(
        'SELECT 1 FROM status_events WHERE name = $1 LIMIT 1', [name]
      );
      if (exists.rowCount === 0) {
        await pool.query('INSERT INTO status_events (name, slug) VALUES ($1, $2)', [name, slug]);
      }
    }
  });

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
