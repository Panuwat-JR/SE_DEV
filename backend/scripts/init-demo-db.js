/**
 * NU SEED — โหลด schema (ถ้ายังไม่มี) + migration + ข้อมูลเดโมสำหรับพอร์ทัลผู้เข้าร่วม
 * เรียกจาก start.sh หลัง Docker Postgres พร้อม
 *
 * ตัวแปรแวดล้อม:
 *   DATABASE_URL        — บังคับ (เช่น postgresql://nuseed:nuseed@127.0.0.1:5432/nuseed)
 *   NU_SEED_FORCE_DEMO  — ตั้งเป็น 1 เพื่อลบชุดเดโมเดิมแล้วใส่ใหม่
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('../config/db');

const DEMO_VERSION = '2026-03-27-v2';
const SCHEMA_FILE = path.join(__dirname, '..', '..', 'se.sql');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const EVENT_TITLES = {
  main: 'NU SEED Innovation Challenge 2026',
  secondary: 'Green Hackathon Phitsanulok',
};

async function tableExists(client, name) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [name]
  );
  return r.rowCount > 0;
}

function applySchemaWithDocker() {
  const composeFile = path.join(__dirname, '..', '..', 'docker-compose.yml');
  if (!fs.existsSync(composeFile)) return false;
  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error('❌ ไม่พบ se.sql ที่', SCHEMA_FILE);
    return false;
  }
  const r = spawnSync(
    'docker',
    [
      'compose',
      '-f',
      composeFile,
      'exec',
      '-T',
      'db',
      'psql',
      '-U',
      'nuseed',
      '-d',
      'nuseed',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    {
      input: fs.readFileSync(SCHEMA_FILE, 'utf8'),
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    }
  );
  if (r.error || r.status !== 0) {
    console.error(r.stderr || r.error?.message || 'docker compose exec psql failed');
    return false;
  }
  return true;
}

async function runMigrations(client) {
  if (!fs.existsSync(MIGRATIONS_DIR)) return;
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
    try {
      await client.query(sql);
    } catch (e) {
      console.warn(`⚠️  migration ${f}: ${e.message}`);
    }
  }
}

async function ensureColumns(client) {
  await client.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS max_participants INT DEFAULT 100,
      ADD COLUMN IF NOT EXISTS current_participants INT DEFAULT 0;
  `);
}

async function ensureMetaTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS demo_seed_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function shouldSkipSeed(client) {
  if (process.env.NU_SEED_FORCE_DEMO === '1') return false;
  const r = await client.query(`SELECT value FROM demo_seed_meta WHERE key = 'demo_version'`);
  return r.rows[0]?.value === DEMO_VERSION;
}

async function upsertMeta(client, key, value) {
  await client.query(
    `INSERT INTO demo_seed_meta (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  );
}

async function wipeDemoData(client) {
  await client.query(`DELETE FROM participant_contact_messages WHERE demo_participant_firstname IN ('ปิยะ', 'สมหญิง')`);
  await client.query(`DELETE FROM team_docs WHERE event_name IN ($1, $2)`, [EVENT_TITLES.main, EVENT_TITLES.secondary]);
  await client.query(`DELETE FROM events WHERE title IN ($1, $2)`, [EVENT_TITLES.main, EVENT_TITLES.secondary]);
  await client.query(`DELETE FROM documents WHERE name IN ('PitchDeck_Draft_v1.pdf', 'ทะเบียนทีม_GreenBridge.pdf')`);
  await client.query(
    `DELETE FROM participant_profiles WHERE (firstname = 'ปิยะ' AND lastname = 'วงศ์ดี')
       OR (firstname = 'สมหญิง' AND lastname = 'ร่วมทีม')`
  );
  await client.query(`DELETE FROM teams WHERE name = 'GreenBridge'`);
  await client.query(`DELETE FROM employees WHERE email IN ('somchai@demo.nu.seed', 'anucha@demo.nu.seed')`);
  await client.query(
    `DELETE FROM employee_profiles ep
     WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.employee_profile_id = ep.employee_profile_id)
       AND (
         (ep.first_name = 'สมชาย' AND ep.last_name = 'ใจดี')
         OR (ep.first_name = 'อนุชา' AND ep.last_name = 'รักงาน')
       )`
  );
}

async function seedReference(client) {
  const inserts = [
    `INSERT INTO priority_levels (name, slug, description, code_color)
     SELECT * FROM (VALUES ('ปกติ', 'medium', 'งานทั่วไป', '#3b82f6')) AS v(name, slug, description, code_color)
     WHERE NOT EXISTS (SELECT 1 FROM priority_levels WHERE slug = 'medium')`,
    `INSERT INTO task_statuses (name, slug, description, code_color)
     SELECT * FROM (VALUES
       ('รอดำเนินการ', 'pending', 'รอเริ่ม', '#94a3b8'),
       ('กำลังดำเนินการ', 'in_progress', 'กำลังทำ', '#3b82f6'),
       ('เสร็จสิ้น', 'completed', 'เสร็จ', '#10b981')
     ) AS v(name, slug, description, code_color)
     WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE task_statuses.slug = v.slug)`,
    `INSERT INTO task_categories (name, slug) SELECT * FROM (VALUES ('ทั่วไป', 'general')) AS v(name, slug)
     WHERE NOT EXISTS (SELECT 1 FROM task_categories WHERE slug = 'general')`,
    `INSERT INTO document_statuses (name, slug) SELECT * FROM (VALUES
       ('ร่าง', 'draft'),
       ('รอการดำเนินการ', 'pending_approval'),
       ('อนุมัติแล้ว', 'approved')
     ) AS v(name, slug)
     WHERE NOT EXISTS (SELECT 1 FROM document_statuses WHERE document_statuses.slug = v.slug)`,
    `INSERT INTO status_events (name, slug) SELECT * FROM (VALUES
       ('วางแผน', 'planning'),
       ('กำลังดำเนินการ', 'in_progress'),
       ('เสร็จสิ้น', 'completed')
     ) AS v(name, slug)
     WHERE NOT EXISTS (SELECT 1 FROM status_events WHERE status_events.slug = v.slug)`,
    `INSERT INTO faculties (name) SELECT 'คณะวิทยาศาสตร์' WHERE NOT EXISTS (SELECT 1 FROM faculties WHERE name = 'คณะวิทยาศาสตร์')`,
    `INSERT INTO majors (name) SELECT 'วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ'
     WHERE NOT EXISTS (SELECT 1 FROM majors WHERE name = 'วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ')`,
    `INSERT INTO participant_types (name) SELECT 'นิสิต/นักศึกษา' WHERE NOT EXISTS (SELECT 1 FROM participant_types WHERE name = 'นิสิต/นักศึกษา')`,
    `INSERT INTO employee_roles (name, description) SELECT 'ผู้จัดการโครงการ', 'ดูแลโครงการ'
     WHERE NOT EXISTS (SELECT 1 FROM employee_roles WHERE name = 'ผู้จัดการโครงการ')`,
    `INSERT INTO employee_roles (name, description) SELECT 'ผู้ประสานงาน', 'ประสานงาน'
     WHERE NOT EXISTS (SELECT 1 FROM employee_roles WHERE name = 'ผู้ประสานงาน')`,
    `INSERT INTO departments (name, description, slug) SELECT 'ฝ่ายโครงการ', 'โครงการ', 'project'
     WHERE NOT EXISTS (SELECT 1 FROM departments WHERE slug = 'project')`,
  ];
  for (const q of inserts) {
    await client.query(q);
  }
}

async function seedDemo(client) {
  const fac = await client.query(`SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์' LIMIT 1`);
  const facultyId = fac.rows[0].faculty_id;
  const maj = await client.query(
    `SELECT major_id FROM majors WHERE name = 'วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ' LIMIT 1`
  );
  const majorId = maj.rows[0].major_id;
  const pt = await client.query(`SELECT participant_type_id FROM participant_types WHERE name = 'นิสิต/นักศึกษา' LIMIT 1`);
  const participantTypeId = pt.rows[0].participant_type_id;

  const stInProgress = await client.query(`SELECT status_event_id FROM status_events WHERE slug = 'in_progress' LIMIT 1`);
  const stPlanning = await client.query(`SELECT status_event_id FROM status_events WHERE slug = 'planning' LIMIT 1`);
  const statusInProgress = stInProgress.rows[0].status_event_id;
  const statusPlanning = stPlanning.rows[0].status_event_id;

  const teamIns = await client.query(
    `INSERT INTO teams (name, project_name) VALUES ('GreenBridge', $1) RETURNING team_id`,
    [EVENT_TITLES.main]
  );
  const teamId = teamIns.rows[0].team_id;

  const leaderProfile = await client.query(
    `INSERT INTO participant_profiles (
       team_id, major_id, faculty_id, participant_type_id, firstname, lastname,
       phone_number, year_of_study, student_id
     ) VALUES ($1, $2, $3, $4, 'ปิยะ', 'วงศ์ดี', '081-111-2222', 3, '651234567')
     RETURNING participant_profile_id`,
    [teamId, majorId, facultyId, participantTypeId]
  );
  const leaderPid = leaderProfile.rows[0].participant_profile_id;

  await client.query(
    `INSERT INTO participants (participant_profile_id, email, password_hash, status)
     VALUES ($1, 'piya@demo.nu.seed', '$2b$10$demo.hash.placeholder.only', 'active')`,
    [leaderPid]
  );

  const memberProfile = await client.query(
    `INSERT INTO participant_profiles (
       team_id, major_id, faculty_id, participant_type_id, firstname, lastname,
       phone_number, year_of_study, student_id
     ) VALUES ($1, $2, $3, $4, 'สมหญิง', 'ร่วมทีม', '082-333-4444', 2, '651888999')
     RETURNING participant_profile_id`,
    [teamId, majorId, facultyId, participantTypeId]
  );
  const memberPid = memberProfile.rows[0].participant_profile_id;

  await client.query(
    `INSERT INTO participants (participant_profile_id, email, password_hash, status)
     VALUES ($1, 'somying@demo.nu.seed', '$2b$10$demo.hash.placeholder.only', 'active')`,
    [memberPid]
  );

  const ev1 = await client.query(
    `INSERT INTO events (
       title, description, status_event_id, event_start_date, event_end_date,
       prize_pool, max_team_member, max_participants, current_participants, is_team_based
     ) VALUES (
       $1,
       'โครงการแข่งขันนวัตกรรมสำหรับนิสิต — ข้อมูลเดโมสำหรับพอร์ทัลผู้เข้าร่วม',
       $2,
       '2026-03-01 09:00:00+07',
       '2026-06-30 18:00:00+07',
       150000,
       6,
       80,
       12,
       TRUE
     ) RETURNING event_id`,
    [EVENT_TITLES.main, statusInProgress]
  );
  const event1Id = ev1.rows[0].event_id;

  const ev2 = await client.query(
    `INSERT INTO events (
       title, description, status_event_id, event_start_date, event_end_date,
       prize_pool, max_team_member, max_participants, current_participants, is_team_based
     ) VALUES (
       $1,
       'แฮคาธอนสิ่งแวดล้อม — เดโม',
       $2,
       '2026-08-01 09:00:00+07',
       '2026-08-03 18:00:00+07',
       50000,
       5,
       40,
       0,
       TRUE
     ) RETURNING event_id`,
    [EVENT_TITLES.secondary, statusPlanning]
  );
  const event2Id = ev2.rows[0].event_id;

  await client.query(
    `INSERT INTO mapping_event_teams (event_id, team_id) VALUES ($1, $3), ($2, $3)`,
    [event1Id, event2Id, teamId]
  );

  const rolePm = await client.query(`SELECT role_employee_id FROM employee_roles WHERE name = 'ผู้จัดการโครงการ' LIMIT 1`);
  const roleCoord = await client.query(`SELECT role_employee_id FROM employee_roles WHERE name = 'ผู้ประสานงาน' LIMIT 1`);
  const dept = await client.query(`SELECT department_id FROM departments WHERE slug = 'project' LIMIT 1`);
  const rolePmId = rolePm.rows[0].role_employee_id;
  const roleCoordId = roleCoord.rows[0].role_employee_id;
  const deptId = dept.rows[0].department_id;

  let emp1 = await client.query(
    `SELECT e.employee_id FROM employees e
     JOIN employee_profiles ep ON ep.employee_profile_id = e.employee_profile_id
     WHERE ep.first_name = 'สมชาย' LIMIT 1`
  );
  if (emp1.rowCount === 0) {
    const ep1 = await client.query(
      `INSERT INTO employee_profiles (role_employee_id, department_id, first_name, last_name, gender)
       VALUES ($1, $2, 'สมชาย', 'ใจดี', 'ชาย') RETURNING employee_profile_id`,
      [rolePmId, deptId]
    );
    await client.query(
      `INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status)
       VALUES ($1, 'somchai@demo.nu.seed', '$2b$10$demo', 'active', 'online')`,
      [ep1.rows[0].employee_profile_id]
    );
    emp1 = await client.query(`SELECT employee_id FROM employees WHERE email = 'somchai@demo.nu.seed'`);
  }
  const employee1Id = emp1.rows[0].employee_id;

  let emp2 = await client.query(
    `SELECT e.employee_id FROM employees e
     JOIN employee_profiles ep ON ep.employee_profile_id = e.employee_profile_id
     WHERE ep.first_name = 'อนุชา' LIMIT 1`
  );
  if (emp2.rowCount === 0) {
    const ep2 = await client.query(
      `INSERT INTO employee_profiles (role_employee_id, department_id, first_name, last_name, gender)
       VALUES ($1, $2, 'อนุชา', 'รักงาน', 'ชาย') RETURNING employee_profile_id`,
      [roleCoordId, deptId]
    );
    await client.query(
      `INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status)
       VALUES ($1, 'anucha@demo.nu.seed', '$2b$10$demo', 'active', 'online')`,
      [ep2.rows[0].employee_profile_id]
    );
    emp2 = await client.query(`SELECT employee_id FROM employees WHERE email = 'anucha@demo.nu.seed'`);
  }
  const employee2Id = emp2.rows[0].employee_id;

  await client.query(
    `INSERT INTO mapping_event_employees (event_id, employee_id) VALUES ($1, $2), ($1, $3) ON CONFLICT DO NOTHING`,
    [event1Id, employee1Id, employee2Id]
  );
  await client.query(
    `INSERT INTO mapping_event_employees (event_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [event2Id, employee1Id]
  );

  const tsPending = await client.query(`SELECT status_task_id FROM task_statuses WHERE slug = 'pending' LIMIT 1`);
  const tsProgress = await client.query(`SELECT status_task_id FROM task_statuses WHERE slug = 'in_progress' LIMIT 1`);
  const tsDone = await client.query(`SELECT status_task_id FROM task_statuses WHERE slug = 'completed' LIMIT 1`);
  const pri = await client.query(`SELECT priority_id FROM priority_levels WHERE slug = 'medium' LIMIT 1`);
  const cat = await client.query(`SELECT task_category_id FROM task_categories WHERE slug = 'general' LIMIT 1`);

  const t1 = await client.query(
    `INSERT INTO tasks (event_id, status_task_id, priority_id, task_category_id, task_name, due_date, description, progress_percent)
     VALUES ($1, $2, $3, $4, 'ส่งเอกสารนำเสนอแนวคิด (Pitch Deck)', NOW() + INTERVAL '5 days', 'อัปโหลด PDF ไม่เกิน 10 หน้า', 40)
     RETURNING task_id`,
    [event1Id, tsProgress.rows[0].status_task_id, pri.rows[0].priority_id, cat.rows[0].task_category_id]
  );
  const t2 = await client.query(
    `INSERT INTO tasks (event_id, status_task_id, priority_id, task_category_id, task_name, due_date, description, progress_percent)
     VALUES ($1, $2, $3, $4, 'ลงทะเบียนทีมและยืนยันอาจารย์ที่ปรึกษา', NOW() - INTERVAL '1 day', 'ครบกำหนดแล้ว — รีบดำเนินการ', 0)
     RETURNING task_id`,
    [event1Id, tsPending.rows[0].status_task_id, pri.rows[0].priority_id, cat.rows[0].task_category_id]
  );
  await client.query(
    `INSERT INTO tasks (event_id, status_task_id, priority_id, task_category_id, task_name, due_date, description, progress_percent)
     VALUES ($1, $2, $3, $4, 'เข้าร่วมอบรม Safety Briefing', NOW() + INTERVAL '14 days', 'อบรมออนไลน์ 1 ชั่วโมง', 100)`,
    [event1Id, tsDone.rows[0].status_task_id, pri.rows[0].priority_id, cat.rows[0].task_category_id]
  );

  const task1Id = t1.rows[0].task_id;
  const task2Id = t2.rows[0].task_id;

  const dsDraft = await client.query(`SELECT doc_status_id FROM document_statuses WHERE slug = 'draft' LIMIT 1`);
  const dsApproved = await client.query(`SELECT doc_status_id FROM document_statuses WHERE slug = 'approved' LIMIT 1`);

  const d1 = await client.query(
    `INSERT INTO documents (doc_status_id, name, file_storage_path, file_type, file_size)
     VALUES ($1, 'PitchDeck_Draft_v1.pdf', NULL, 'application/pdf', 240000)
     RETURNING document_id`,
    [dsDraft.rows[0].doc_status_id]
  );
  const d2 = await client.query(
    `INSERT INTO documents (doc_status_id, name, file_storage_path, file_type, file_size)
     VALUES ($1, 'ทะเบียนทีม_GreenBridge.pdf', '/uploads/demo-team-reg.pdf', 'application/pdf', 120000)
     RETURNING document_id`,
    [dsApproved.rows[0].doc_status_id]
  );

  await client.query(`INSERT INTO mapping_doc_tasks (task_id, document_id) VALUES ($1, $2), ($3, $4) ON CONFLICT DO NOTHING`, [
    task1Id,
    d1.rows[0].document_id,
    task2Id,
    d2.rows[0].document_id,
  ]);

  await client.query(
    `INSERT INTO team_docs (file_name, file_storage_path, file_type, file_size, event_name, task_name)
     VALUES ('README_GreenBridge.pdf', '/uploads/demo-readme.pdf', 'application/pdf', 80000, $1, 'เอกสารทีม')`,
    [EVENT_TITLES.main]
  );

  const partPiya = await client.query(`SELECT participant_id FROM participants WHERE email = 'piya@demo.nu.seed'`);
  const participantId = partPiya.rows[0].participant_id;
  await client.query(
    `INSERT INTO feedbacks (participant_id, rating, comment) VALUES ($1, 5, $2)`,
    [participantId, '[participant_portal] {"projectTitle":"NU SEED Innovation Challenge 2026","aspects":{},"comment":"กิจกรรมดีมากครับ เดโม"}']
  );

  await upsertMeta(client, 'demo_version', DEMO_VERSION);
  await upsertMeta(client, 'demo_participant_firstname', 'ปิยะ');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  ไม่มี DATABASE_URL — ข้ามการ seed DB');
    return;
  }

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.warn('⚠️  เชื่อมต่อ PostgreSQL ไม่ได้:', e.message);
    return;
  }

  try {
    const hasSchema = await tableExists(client, 'events');
    if (!hasSchema) {
      client.release();
      client = null;
      console.log('📐 ยังไม่มีตาราง — กำลังสร้าง schema จาก se.sql (Docker)...');
      if (!applySchemaWithDocker()) {
        process.exitCode = 1;
        return;
      }
      console.log('✅ สร้าง schema แล้ว');
      client = await pool.connect();
    }

    await ensureMetaTable(client);
    await runMigrations(client);
    await ensureColumns(client);
    await seedReference(client);

    if (await shouldSkipSeed(client)) {
      console.log(
        '✅ ฐานข้อมูลเดโมพร้อมแล้ว (รุ่น ' +
          DEMO_VERSION +
          ') — ตั้ง NU_SEED_FORCE_DEMO=1 แล้วรัน npm run init-demo-db เพื่อใส่ข้อมูลใหม่'
      );
      return;
    }

    console.log('🌱 กำลังใส่ข้อมูลเดโม NU SEED...');
    await client.query('BEGIN');
    await wipeDemoData(client);
    await seedDemo(client);
    await client.query('COMMIT');
    console.log('✅ ใส่ข้อมูลเดโมเรียบร้อย — เข้าพอร์ทัลผู้เข้าร่วมด้วยชื่อ firstname: ปิยะ');
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {
      /* ignore */
    }
    console.error('❌ init-demo-db:', e.message);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
