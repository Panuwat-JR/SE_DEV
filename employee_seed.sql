-- =====================================================
-- Employee Seed (idempotent)
-- รันซ้ำได้: ไม่ซ้ำ role/dept/profile ตามเงื่อนไข, employees upsert ตาม email
-- รหัสผ่าน demo: password123 (bcrypt จาก bcryptjs cost 10)
-- =====================================================

-- 1. Employee Roles (ไม่มี UNIQUE บน name ใน schema เดิม — ใช้ NOT EXISTS)
INSERT INTO employee_roles (name, description)
SELECT v.name, v.description
FROM (VALUES
  ('ผู้จัดการโครงการ', 'รับผิดชอบการบริหารและดูแลโครงการ'),
  ('นักวิเคราะห์',     'วิเคราะห์ข้อมูลและวิจัย'),
  ('ผู้ประสานงาน',    'ประสานงานระหว่างหน่วยงาน'),
  ('เจ้าหน้าที่การเงิน','ดูแลการเงินและบัญชี'),
  ('ผู้จัดการทีม',    'บริหารจัดการทีม')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM employee_roles er WHERE er.name = v.name);

-- 2. Departments
INSERT INTO departments (name, description, slug)
SELECT v.name, v.description, v.slug
FROM (VALUES
  ('ฝ่ายโครงการ',    'หน่วยงานดูแลโครงการ',    'project'),
  ('ฝ่ายวิจัย',      'หน่วยงานวิจัยและพัฒนา',   'research'),
  ('ฝ่ายปฏิบัติการ', 'หน่วยงานปฏิบัติการ',       'operations'),
  ('ฝ่ายการเงิน',    'หน่วยงานการเงินและบัญชี',  'finance')
) AS v(name, description, slug)
WHERE NOT EXISTS (
  SELECT 1 FROM departments d WHERE d.slug = v.slug OR d.name = v.name
);

-- 3. Employee Profiles — เฉพาะคู่ชื่อที่ยังไม่มีในระบบ
INSERT INTO employee_profiles (role_employee_id, department_id, first_name, last_name, gender)
SELECT
  r.role_employee_id,
  d.department_id,
  v.first_name,
  v.last_name,
  v.gender
FROM (VALUES
  ('สมชาย',   'สมศรี',    'ชาย',   'ผู้จัดการโครงการ',   'ฝ่ายโครงการ'),
  ('วิไลวรรณ','สุขใจ',    'หญิง',  'นักวิเคราะห์',       'ฝ่ายวิจัย'),
  ('อนุชา',   'รักษา',    'ชาย',   'ผู้ประสานงาน',       'ฝ่ายปฏิบัติการ'),
  ('นิภา',    'ศรีสุข',   'หญิง',  'เจ้าหน้าที่การเงิน', 'ฝ่ายการเงิน'),
  ('กานดา',   'มณีรัตน์', 'หญิง',  'ผู้จัดการทีม',       'ฝ่ายโครงการ')
) AS v(first_name, last_name, gender, role_name, dept_name)
JOIN employee_roles r ON r.name = v.role_name
JOIN departments    d ON d.name = v.dept_name
WHERE NOT EXISTS (
  SELECT 1 FROM employee_profiles ep
  WHERE ep.first_name = v.first_name AND ep.last_name = v.last_name
);

-- 4. Employees — ผูก profile ด้วยชื่อ+นามสกุล (เลือก employee_profile_id มากสุดถ้ามีซ้ำ)
INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status)
SELECT DISTINCT ON (v.email)
  ep.employee_profile_id,
  v.email,
  '$2a$10$DE8L1UqCUgU2NULIarUT2.MQCQTtTawrwJorCENPJdZKjWdcKFB56',
  'active',
  v.online_status
FROM (VALUES
  ('สมชาย',    'สมศรี',    'somchai@se.dev',   'online'),
  ('วิไลวรรณ', 'สุขใจ',   'wilaiwan@se.dev',  'offline'),
  ('อนุชา',    'รักษา',   'anucha@se.dev',    'online'),
  ('นิภา',     'ศรีสุข',  'nipa@se.dev',      'online'),
  ('กานดา',    'มณีรัตน์','kanda@se.dev',     'offline')
) AS v(first_name, last_name, email, online_status)
JOIN employee_profiles ep ON ep.first_name = v.first_name AND ep.last_name = v.last_name
ORDER BY v.email, ep.employee_profile_id DESC
ON CONFLICT (email) DO UPDATE SET
  online_status = EXCLUDED.online_status,
  status        = EXCLUDED.status;
