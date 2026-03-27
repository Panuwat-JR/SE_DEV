-- =====================================================
-- Employee Seed Migration
-- Seeds employee_roles, departments, employee_profiles,
-- and employees to match INITIAL_EMPLOYEES in mockData.js
-- =====================================================

-- 1. Employee Roles
INSERT INTO employee_roles (name, description) VALUES
  ('ผู้จัดการโครงการ', 'รับผิดชอบการบริหารและดูแลโครงการ'),
  ('นักวิเคราะห์',     'วิเคราะห์ข้อมูลและวิจัย'),
  ('ผู้ประสานงาน',    'ประสานงานระหว่างหน่วยงาน'),
  ('เจ้าหน้าที่การเงิน','ดูแลการเงินและบัญชี'),
  ('ผู้จัดการทีม',    'บริหารจัดการทีม')
ON CONFLICT DO NOTHING;

-- 2. Departments
INSERT INTO departments (name, description, slug) VALUES
  ('ฝ่ายโครงการ',    'หน่วยงานดูแลโครงการ',    'project'),
  ('ฝ่ายวิจัย',      'หน่วยงานวิจัยและพัฒนา',   'research'),
  ('ฝ่ายปฏิบัติการ', 'หน่วยงานปฏิบัติการ',       'operations'),
  ('ฝ่ายการเงิน',    'หน่วยงานการเงินและบัญชี',  'finance')
ON CONFLICT DO NOTHING;

-- 3. Employee Profiles
-- Lookup role and department IDs by name so IDs don't matter
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
JOIN departments    d ON d.name = v.dept_name;

-- 4. Employees (accounts linked to profiles)
-- Password hash is bcrypt of 'password123' — safe demo placeholder
INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status)
SELECT
  ep.employee_profile_id,
  v.email,
  '$2b$10$X9kl7g/.example.hash.placeholder.for.demo.only',
  'active',
  v.online_status
FROM (VALUES
  ('สมชาย',    'somchai@se.dev',   'online'),
  ('วิไลวรรณ', 'wilaiwan@se.dev',  'offline'),
  ('อนุชา',    'anucha@se.dev',    'online'),
  ('นิภา',     'nipa@se.dev',      'online'),
  ('กานดา',    'kanda@se.dev',     'offline')
) AS v(first_name, email, online_status)
JOIN employee_profiles ep ON ep.first_name = v.first_name
ON CONFLICT (email) DO UPDATE SET
  online_status = EXCLUDED.online_status,
  status        = EXCLUDED.status;
