-- ============================================================
-- Mock Data (NU SciPark / NU SEED) สำหรับ Executive Dashboard
-- ไฟล์นี้ออกแบบมาเพื่อให้ลบข้อมูล Mock เก่าทิ้งก่อน แล้วเพิ่มใหม่ให้ครบถ้วน 
-- (ข้อมูลดั้งเดิมที่คุณใส่ไว้ หรือข้อมูลจาก seed_data จะไม่หายไป)
-- ============================================================

-- -------------------------------------------------------------
-- 0. ล้างข้อมูล Mock เดิมก่อน (เพื่อกันการเพิ่มข้อมูลซ้ำซ้อน)
-- -------------------------------------------------------------
DELETE FROM feedbacks WHERE comment LIKE '[Mock]%';
DELETE FROM tasks WHERE task_name LIKE '[Mock]%';
DELETE FROM mapping_event_teams WHERE team_id IN (SELECT team_id FROM teams WHERE name LIKE '[Mock]%');
DELETE FROM mapping_event_employees WHERE employee_id IN (SELECT employee_id FROM employees WHERE email LIKE '%@nuscipark.ac.th');
DELETE FROM documents WHERE name LIKE '[Mock]%';
DELETE FROM participants WHERE email LIKE '%@mockstudent.com';
DELETE FROM participant_profiles WHERE firstname LIKE '[Mock]%';
DELETE FROM teams WHERE name LIKE '[Mock]%';
DELETE FROM employees WHERE email LIKE '%@nuscipark.ac.th';
DELETE FROM employee_profiles WHERE first_name LIKE '[Mock]%';
DELETE FROM events WHERE title IN ('Startup Thailand League (STL) 2026', 'Experiential Learning Program (ELP) 2026', 'New Regional Startups', 'Research to Market (R2M)', 'Idea Pitch Day / NU Hackathon', 'TED Youth Startup');

-- ข้อมูลตั้งต้นที่มีโอกาสซ้ำ 
DELETE FROM event_types WHERE slug IN ('comp', 'workshop', 'bootcamp');
DELETE FROM event_categories WHERE slug IN ('startup', 'commercial-research', 'innovation');
DELETE FROM requirement_tags WHERE slug IN ('nu-student', 'team-3-5', 'has-idea', 'has-research');
DELETE FROM logistics WHERE format LIKE '[Mock]%';
DELETE FROM departments WHERE slug IN ('incubation', 'ip', 'sci-service');
DELETE FROM employee_roles WHERE name IN ('ผู้จัดการโครงการ', 'เจ้าหน้าที่ประสานงาน', 'ที่ปรึกษาธุรกิจ');
DELETE FROM participant_types WHERE name IN ('นิสิต', 'บุคคลทั่วไป');
DELETE FROM task_categories WHERE slug IN ('prep', 'pr', 'event', 'summary');
DELETE FROM document_types WHERE slug IN ('app-form', 'summary-report', 'invitation');

-- -------------------------------------------------------------
-- 0.5. ซิงค์ Sequence ของ ID เพื่อป้องกัน Error: duplicate key value
-- (เกิดจากการที่ตารางมีข้อมูลอยู่แล้ว แต่ระบบนับ Auto Increment ผิด)
-- -------------------------------------------------------------
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            t.relname AS table_name,
            c.attname AS column_name,
            s.relname AS sequence_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON t.oid = d.refobjid
        JOIN pg_attribute c ON c.attrelid = t.oid AND c.attnum = d.refobjsubid
        WHERE s.relkind = 'S' AND t.relkind = 'r'
    ) LOOP
        EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 0) + 1, false)', r.sequence_name, r.column_name, r.table_name);
    END LOOP;
END $$;


-- -------------------------------------------------------------
-- 1. เพิ่มข้อมูลกลุ่ม A: ตารางพื้นฐาน
-- -------------------------------------------------------------
INSERT INTO event_types (name, description, slug) VALUES
('แข่งขัน', 'การแข่งขันประลองไอเดียหรือแผนธุรกิจ', 'comp'),
('อบรม/Workshop', 'การให้ความรู้และฝึกปฏิบัติ', 'workshop'),
('Bootcamp', 'การเข้าค่ายติวเข้มแบบเจาะลึก', 'bootcamp');

INSERT INTO event_categories (name, description, slug) VALUES
('สตาร์ทอัพ (Startup)', 'เน้นการสร้างธุรกิจที่เติบโตแบบก้าวกระโดด', 'startup'),
('วิจัยเชิงพาณิชย์', 'นำงานวิจัยเดิมมาปั้นเพื่อขายจริง', 'commercial-research'),
('นวัตกรรมทั่วไป', 'เน้นผลิตภัณฑ์หรืองานประดิษฐ์', 'innovation');

INSERT INTO requirement_tags (name, code_color, slug) VALUES
('นิสิต ม.นเรศวร', '#3b82f6', 'nu-student'),
('ทีม 3-5 คน', '#10b981', 'team-3-5'),
('มีไอเดียธุรกิจ', '#f59e0b', 'has-idea'),
('มีงานวิจัยพร้อมต่อยอด', '#8b5cf6', 'has-research');

INSERT INTO logistics (format, location, max_participant) VALUES
('[Mock] Onsite', 'NU SciPark Co-working Space', 100),
('[Mock] Onsite', 'Auditorium ห้อง 201', 300),
('[Mock] Online', 'Zoom Meeting / Microsoft Teams', 500);

-- ผู้จัดงาน (เพิ่มถ้ายังไม่มี NU SEED)
INSERT INTO organizers (name, description, location, contact) 
SELECT 'NU SEED (อุทยานวิทยาศาสตร์ ม.นเรศวร)', 'หน่วยงานหลักที่ทำหน้าที่ส่งเสริมและสนับสนุนนวัตกรรม ธุรกิจ Startup และ SME แบบครบวงจร', 'มหาวิทยาลัยนเรศวร', 'nuseed@nu.ac.th'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'NU SEED (อุทยานวิทยาศาสตร์ ม.นเรศวร)');

INSERT INTO departments (name, description, slug) VALUES
('ฝ่ายบ่มเพาะธุรกิจ', 'ดูแล Startup และ SME', 'incubation'),
('ฝ่ายทรัพย์สินทางปัญญา', 'ดูแลเรื่องสิทธิบัตรและลิขสิทธิ์', 'ip'),
('ฝ่ายบริการวิทยาศาสตร์', 'ดูแลห้อง Lab และเครื่องมือ', 'sci-service');

INSERT INTO employee_roles (name, description) VALUES
('ผู้จัดการโครงการ', 'ควบคุมภาพรวมแผนงานทั้งหมด'),
('เจ้าหน้าที่ประสานงาน', 'ติดต่อบุคลากรภายนอกและจัดการเอกสาร'),
('ที่ปรึกษาธุรกิจ', 'ให้คำปรึกษาด้านแผนธุรกิจเบื้องต้น');

INSERT INTO participant_types (name) VALUES ('นิสิต'), ('บุคคลทั่วไป');

INSERT INTO task_categories (name, description, slug) VALUES
('งานเตรียมงาน', 'จองสถานที่ จัดทำเอกสาร', 'prep'),
('งานประชาสัมพันธ์', 'โพสต์สื่อ แต่งรูป ยิงแอด', 'pr'),
('งานจัดกิจกรรม', 'หน้างาน ดูแลผู้เข้าร่วม', 'event'),
('งานสรุปผล', 'ทำรายงาน สรุปผลประเมิน', 'summary');

INSERT INTO document_types (name, slug, code_color, description) VALUES
('ฟอร์มสมัครเข้าร่วม', 'app-form', '#3b82f6', 'เอกสารกรอกข้อมูลใบสมัคร'),
('รายงานสรุปผล', 'summary-report', '#10b981', 'เอกสารปิดท้ายโครงการพร้อมผลประกอบการ'),
('หนังสือเชิญวิทยากร', 'invitation', '#f59e0b', 'เอกสารติดต่อภายนอก');


-- -------------------------------------------------------------
-- 2. เพิ่มข้อมูลกลุ่ม B: เจ้าหน้าที่ (Employees)
-- -------------------------------------------------------------
INSERT INTO employee_profiles (role_employee_id, department_id, first_name, last_name, gender, birthday_date) VALUES
((SELECT role_employee_id FROM employee_roles WHERE name='ผู้จัดการโครงการ' LIMIT 1), (SELECT department_id FROM departments WHERE slug='incubation' LIMIT 1), '[Mock] สมชาย', 'สายลุย', 'ชาย', '1990-05-15'),
((SELECT role_employee_id FROM employee_roles WHERE name='เจ้าหน้าที่ประสานงาน' LIMIT 1), (SELECT department_id FROM departments WHERE slug='incubation' LIMIT 1), '[Mock] สมหญิง', 'จริงใจ', 'หญิง', '1995-12-10'),
((SELECT role_employee_id FROM employee_roles WHERE name='ที่ปรึกษาธุรกิจ' LIMIT 1), (SELECT department_id FROM departments WHERE slug='ip' LIMIT 1), '[Mock] ชาติชาย', 'มีวิสัยทัศน์', 'ชาย', '1985-08-20');

INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status) VALUES
((SELECT employee_profile_id FROM employee_profiles WHERE first_name='[Mock] สมชาย' LIMIT 1), 'somchai.s@nuscipark.ac.th', '12345678', 'Active', 'Online'),
((SELECT employee_profile_id FROM employee_profiles WHERE first_name='[Mock] สมหญิง' LIMIT 1), 'somying.j@nuscipark.ac.th', '12345678', 'Active', 'Offline'),
((SELECT employee_profile_id FROM employee_profiles WHERE first_name='[Mock] ชาติชาย' LIMIT 1), 'chartchai.m@nuscipark.ac.th', '12345678', 'Active', 'Online');


-- -------------------------------------------------------------
-- 3. เพิ่มข้อมูลกลุ่ม C: โครงการ (Events)
-- -------------------------------------------------------------
INSERT INTO events (
    title, description, organizer_id, event_type_id, event_category_id, logistics_id, requirement_tag_id, status_event_id, 
    registration_start_date, registration_end_date, event_start_date, event_end_date, announcement_date, 
    prize_pool, is_team_based, max_team_member, min_team_member, budget, academic_year
) VALUES
-- 1. STL (In Progress)
('Startup Thailand League (STL) 2026', 'เวทีแข่งขันสตาร์ทอัพระดับประเทศ ค้นหาสตาร์ทอัพไฟแรงเพื่อเป็นตัวแทนระดับภูมิภาค', 
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NU SEED%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='comp' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='startup' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=300 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='nu-student' LIMIT 1), 
 (SELECT status_event_id FROM status_events WHERE slug='in_progress' LIMIT 1), 
 '2026-04-01', '2026-04-20', '2026-05-10', '2026-05-12', '2026-05-15', 50000.00, TRUE, 5, 3, 200000.00, 2567),

-- 2. ELP (Open Registration)
('Experiential Learning Program (ELP) 2026', 'โครงการคัดเลือกตัวแทนนวัตกร ส่งไปเปิดประสบการณ์ระบบนิเวศธุรกิจต่างประเทศ',
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NU SEED%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='bootcamp' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='innovation' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=100 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='team-3-5' LIMIT 1),
 (SELECT status_event_id FROM status_events WHERE slug='open_registration' LIMIT 1),
 '2026-05-01', '2026-06-01', '2026-06-15', '2026-06-20', '2026-06-25', 0.00, TRUE, 4, 2, 450000.00, 2567),

-- 3. New Regional Startups (Completed)
('New Regional Startups', 'เฟ้นหาไอเดียธุรกิจจากผู้เข้าร่วม เพื่อเงินทุนสนับสนุนผลิตภัณฑ์ต้นแบบ',
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NU SEED%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='comp' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='startup' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=300 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='has-idea' LIMIT 1),
 (SELECT status_event_id FROM status_events WHERE slug='completed' LIMIT 1),
 '2025-10-01', '2025-10-31', '2025-12-01', '2025-12-03', '2025-12-05', 100000.00, TRUE, 5, 3, 150000.00, 2566),

-- 4. R2M (Planning)
('Research to Market (R2M)', 'เส้นทางสู่นวัตวณิชย์ นำ "งานวิจัย" บนหิ้งมาต่อยอดแผนธุรกิจสู่ตลาดพาณิชย์',
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NU SEED%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='workshop' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='commercial-research' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=100 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='has-research' LIMIT 1),
 (SELECT status_event_id FROM status_events WHERE slug='planning' LIMIT 1),
 '2026-07-01', '2026-07-31', '2026-08-15', '2026-08-16', '2026-08-20', 30000.00, TRUE, 3, 2, 80000.00, 2567),

-- 5. Idea Pitch Day (Closed Registration)
('Idea Pitch Day / NU Hackathon', 'ประชันไอเดียธุรกิจแบบเปิดกว้าง "แค่มีไอเดียก็เข้าร่วมได้"',
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NU SEED%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='comp' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='innovation' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=500 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='nu-student' LIMIT 1),
 (SELECT status_event_id FROM status_events WHERE slug='closed_registration' LIMIT 1),
 '2026-03-01', '2026-03-25', '2026-04-05', '2026-04-06', '2026-04-07', 15000.00, TRUE, 5, 1, 50000.00, 2567),

-- 6. TED Youth Startup (Announced)
('TED Youth Startup', 'เวทีชิงทุนสนับสนุนก้อนใหญ่สูงสุด 1.5 ล้านบาท สำหรับผู้ประกอบการหน้าใหม่',
 (SELECT organizer_id FROM organizers WHERE name LIKE 'NIA%' LIMIT 1), (SELECT event_type_id FROM event_types WHERE slug='comp' LIMIT 1), (SELECT event_category_id FROM event_categories WHERE slug='startup' LIMIT 1), (SELECT logistics_id FROM logistics WHERE max_participant=100 LIMIT 1), (SELECT requirement_tag_id FROM requirement_tags WHERE slug='has-idea' LIMIT 1),
 (SELECT status_event_id FROM status_events WHERE slug='announced' LIMIT 1),
 '2026-01-15', '2026-02-15', '2026-03-10', '2026-03-12', '2026-03-15', 1500000.00, TRUE, 5, 2, 20000.00, 2566);


-- -------------------------------------------------------------
-- 4. เพิ่มข้อมูลกลุ่ม D: ทีมและหน้าที่รับผิดชอบ
-- -------------------------------------------------------------
INSERT INTO teams (name, project_name) VALUES
('[Mock] Team Alpha', 'AI Medical Assistant'),
('[Mock] Team Beta', 'Smart Farming IoT'),
('[Mock] Team Gamma', 'Green Packaging'),
('[Mock] Team Delta', 'Elderly Care Robot');

-- นำทีม 1 เข้า STL / ทีม 2 เข้า ELP / ทีม 3 เข้า Regional (จบแล้ว) / ทีม 4 เข้า Hackathon
INSERT INTO mapping_event_teams (event_id, team_id) VALUES
((SELECT event_id FROM events WHERE title='Startup Thailand League (STL) 2026' LIMIT 1), (SELECT team_id FROM teams WHERE name='[Mock] Team Alpha' LIMIT 1)),
((SELECT event_id FROM events WHERE title='Experiential Learning Program (ELP) 2026' LIMIT 1), (SELECT team_id FROM teams WHERE name='[Mock] Team Beta' LIMIT 1)),
((SELECT event_id FROM events WHERE title='New Regional Startups' LIMIT 1), (SELECT team_id FROM teams WHERE name='[Mock] Team Gamma' LIMIT 1)),
((SELECT event_id FROM events WHERE title='Idea Pitch Day / NU Hackathon' LIMIT 1), (SELECT team_id FROM teams WHERE name='[Mock] Team Delta' LIMIT 1)),
((SELECT event_id FROM events WHERE title='TED Youth Startup' LIMIT 1), (SELECT team_id FROM teams WHERE name='[Mock] Team Alpha' LIMIT 1)); -- Alpha แข่ง 2 งาน

-- Assign เจ้าหน้าที่รับผิดชอบงาน
INSERT INTO mapping_event_employees (event_id, employee_id) VALUES
((SELECT event_id FROM events WHERE title='Startup Thailand League (STL) 2026' LIMIT 1), (SELECT employee_id FROM employees WHERE email='somchai.s@nuscipark.ac.th' LIMIT 1)),
((SELECT event_id FROM events WHERE title='Experiential Learning Program (ELP) 2026' LIMIT 1), (SELECT employee_id FROM employees WHERE email='somying.j@nuscipark.ac.th' LIMIT 1)),
((SELECT event_id FROM events WHERE title='Research to Market (R2M)' LIMIT 1), (SELECT employee_id FROM employees WHERE email='chartchai.m@nuscipark.ac.th' LIMIT 1));


-- -------------------------------------------------------------
-- 5. เพิ่มข้อมูลกลุ่ม E: นิสิตผู้เข้าร่วม (Participants)
-- -------------------------------------------------------------
INSERT INTO participant_profiles (participant_type_id, gender, prefix, firstname, lastname, phone_number, student_id, year_of_study, team_id, birthday_date) VALUES
((SELECT participant_type_id FROM participant_types WHERE name='นิสิต' LIMIT 1), 'ชาย', 'นาย', '[Mock] อรชุน', 'แผลงศร', '0891112222', '64123450', 3, (SELECT team_id FROM teams WHERE name='[Mock] Team Alpha' LIMIT 1), '2000-01-01'),
((SELECT participant_type_id FROM participant_types WHERE name='นิสิต' LIMIT 1), 'หญิง', 'นางสาว', '[Mock] มะลิ', 'บุปผา', '0891113333', '64123451', 3, (SELECT team_id FROM teams WHERE name='[Mock] Team Beta' LIMIT 1), '2001-02-02'),
((SELECT participant_type_id FROM participant_types WHERE name='นิสิต' LIMIT 1), 'ชาย', 'นาย', '[Mock] อาทิตย์', 'สว่างวงษ์', '0891114444', '63123452', 4, (SELECT team_id FROM teams WHERE name='[Mock] Team Gamma' LIMIT 1), '1999-03-03'),
((SELECT participant_type_id FROM participant_types WHERE name='นิสิต' LIMIT 1), 'หญิง', 'นางสาว', '[Mock] จันทร์กะพ้อ', 'หอมหวล', '0891115555', '65123453', 2, (SELECT team_id FROM teams WHERE name='[Mock] Team Delta' LIMIT 1), '2002-04-04');

INSERT INTO participants (participant_profile_id, email, password_hash, status) VALUES
((SELECT participant_profile_id FROM participant_profiles WHERE firstname='[Mock] อรชุน' LIMIT 1), 'archun@mockstudent.com', '123456', 'Active'),
((SELECT participant_profile_id FROM participant_profiles WHERE firstname='[Mock] มะลิ' LIMIT 1), 'mali@mockstudent.com', '123456', 'Active'),
((SELECT participant_profile_id FROM participant_profiles WHERE firstname='[Mock] อาทิตย์' LIMIT 1), 'athit@mockstudent.com', '123456', 'Active'),
((SELECT participant_profile_id FROM participant_profiles WHERE firstname='[Mock] จันทร์กะพ้อ' LIMIT 1), 'chan@mockstudent.com', '123456', 'Active');


-- -------------------------------------------------------------
-- 6. เพิ่มข้อมูลกลุ่ม F: ความเห็น (Feedbacks) -- เพื่อทำกราฟ Sentiment
-- -------------------------------------------------------------
INSERT INTO feedbacks (participant_id, comment, rating) VALUES
((SELECT participant_id FROM participants WHERE email='archun@mockstudent.com' LIMIT 1), '[Mock] สุดยอดมากครับ ได้เรียนรู้เทคนิค Pitching จากผู้เชี่ยวชาญจริงๆ', 5),
((SELECT participant_id FROM participants WHERE email='mali@mockstudent.com' LIMIT 1), '[Mock] วิทยากรให้ความรู้ดีมาก แต่เวลาน้อยไปนิดนึงค่ะ', 4),
((SELECT participant_id FROM participants WHERE email='athit@mockstudent.com' LIMIT 1), '[Mock] สถานที่จัดงานแอร์หนาวมาก แต่อาหารอร่อยโอเคครับระดับกลางๆ', 3),
((SELECT participant_id FROM participants WHERE email='chan@mockstudent.com' LIMIT 1), '[Mock] ไม่ค่อยชอบระบบประกาศผลเลย รอนานเกินไปและไม่ชัดเจน', 2),
((SELECT participant_id FROM participants WHERE email='archun@mockstudent.com' LIMIT 1), '[Mock] งาน TED Youth นี้รางวัลเยอะก็จริงแต่จัดการเอกสารยุ่งยากมาก', 3);


-- -------------------------------------------------------------
-- 7. เพิ่มข้อมูลกลุ่ม G: งานโครงการและเอกสาร (Tasks & Documents)
-- -------------------------------------------------------------
INSERT INTO tasks (event_id, status_task_id, priority_id, task_category_id, task_name, due_date, description, progress_percent, start_date, actual_finished_date) VALUES
-- Task สำหรับ STL (Done)
((SELECT event_id FROM events WHERE title='Startup Thailand League (STL) 2026' LIMIT 1), (SELECT status_task_id FROM task_statuses WHERE slug='completed' LIMIT 1), (SELECT priority_id FROM priority_levels WHERE slug='high' LIMIT 1), (SELECT task_category_id FROM task_categories WHERE slug='prep' LIMIT 1), '[Mock] ร่างหนังสือขออนุมัติจัดโครงการ', '2026-03-10', 'เขียนหนังสือขออนุมัติงบ 200,000 ให้ผอ.เซ็น', 100, '2026-03-01', '2026-03-09'),
-- Task สำหรับ STL (Progress)
((SELECT event_id FROM events WHERE title='Startup Thailand League (STL) 2026' LIMIT 1), (SELECT status_task_id FROM task_statuses WHERE slug='in_progress' LIMIT 1), (SELECT priority_id FROM priority_levels WHERE slug='urgent' LIMIT 1), (SELECT task_category_id FROM task_categories WHERE slug='pr' LIMIT 1), '[Mock] โพสต์รับสมัครลงเพจ NU SEED', '2026-04-05', 'ยิงแอด Facebook และแชร์เข้ากลุ่มนิสิตม.นเรศวร', 60, '2026-04-01', NULL),
-- Task สำหรับ ELP (Pending)
((SELECT event_id FROM events WHERE title='Experiential Learning Program (ELP) 2026' LIMIT 1), (SELECT status_task_id FROM task_statuses WHERE slug='pending' LIMIT 1), (SELECT priority_id FROM priority_levels WHERE slug='medium' LIMIT 1), (SELECT task_category_id FROM task_categories WHERE slug='event' LIMIT 1), '[Mock] ประสานงานสถานที่ห้องประชุม', '2026-05-15', 'จองห้อง Auditorium 201 และชุดไมค์', 0, NULL, NULL);

INSERT INTO documents (doc_status_id, name, is_digital_signed, file_storage_path, file_type, file_size) VALUES
((SELECT doc_status_id FROM document_statuses WHERE slug='approved' LIMIT 1), '[Mock] อนุมัติงบประมาณ STL', TRUE, '/storage/docs/approve_stl.pdf', 'pdf', 1024000),
((SELECT doc_status_id FROM document_statuses WHERE slug='pending_approval' LIMIT 1), '[Mock] หนังสือเชิญวิทยากร ELP', FALSE, '/storage/docs/invite_elp.docx', 'docx', 512000);

-- ============================================================
-- เสร็จสิ้นการ Mock Data
-- โปรด Refresh หน้า Dashboard ระบบจะมีข้อมูลครบทุกส่วน
-- ============================================================
