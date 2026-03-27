-- ============================================================
-- Mock Data สำหรับ Executive Dashboard
-- ไฟล์นี้ใช้รันหลังจาก se_v2.sql + seed_data.sql เรียบร้อยแล้ว
-- ============================================================

-- 1. สถานะเอกสาร (document_statuses)
INSERT INTO document_statuses (name, slug, code_color) VALUES
('แบบร่าง', 'draft', '#94a3b8'),
('รออนุมัติ', 'pending_approval', '#f59e0b'),
('อนุมัติแล้ว', 'approved', '#10b981'),
('ถูกปฏิเสธ', 'rejected', '#ef4444');

-- 2. ผู้จัดงาน (organizers)
INSERT INTO organizers (name, description, location, contact) VALUES
('NIA', 
 'สำนักงานนวัตกรรมแห่งชาติ (องค์การมหาชน) คือหน่วยงานหลักภายใต้กระทรวงการอุดมศึกษาฯ (อว.) ที่ทำหน้าที่เป็น "สะพานเชื่อม" ช่วยผลักดันไอเดียใหม่ๆ ให้กลายเป็นธุรกิจนวัตกรรมที่ทำเงินได้จริง ผ่านการให้เงินทุนสนับสนุน การบ่มเพาะความรู้ และการสร้างเครือข่ายให้นักธุรกิจรุ่นใหม่',
 '73/2 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400',
 E'เบอร์โทรศัพท์: 02-017-5555\nอีเมลกลาง: info@nia.or.th\nอีเมลส่งเอกสารราชการ: saraban@nia.or.th\nเว็บไซต์: www.nia.or.th\nFacebook: NIA: National Innovation Agency');

-- 3. โครงการ (events)
INSERT INTO events (organizer_id, title, description, registration_start_date, registration_end_date, event_start_date, event_end_date, announcement_date, prize_pool, is_team_based, max_team_member, min_team_member, budget, academic_year) VALUES
(1, 'start up thailand league 2026', 
 'เวทีประกวดแผนธุรกิจระดับอุดมศึกษาที่เปิดโอกาสให้นักศึกษารวมกลุ่มกันนำไอเดียเทคโนโลยีมาสร้างเป็นธุรกิจจริง โดยผู้ที่ผ่านการคัดเลือกจะได้รับเงินทุนสนับสนุนการทำต้นแบบ 50,000 บาท พร้อมรับการบ่มเพาะจากผู้เชี่ยวชาญเพื่อก้าวสู่การเป็นสตาร์ทอัพระดับมืออาชีพ',
 '2026-04-01 09:00:00', '2026-04-15 18:00:00', '2026-05-01 08:30:00', '2026-05-03 17:00:00', '2026-05-05 17:00:00',
 100000.00, TRUE, 5, 3, 500000.00, NULL);

-- 4. ทีมเอกสาร (team_docs) - ถ้ามี
-- (ปัจจุบัน: ไม่มีข้อมูล)

-- 5. ทีม (teams)
INSERT INTO teams (name, project_name) VALUES
('Team CodeX', NULL);

-- 6. เชื่อมทีมเข้ากับโครงการ (mapping_event_teams)
INSERT INTO mapping_event_teams (event_id, team_id) VALUES
(1, 1);

-- 7. โปรไฟล์ผู้เข้าร่วม (participant_profiles)
INSERT INTO participant_profiles (participant_type_id, major_id, faculty_id, gender, prefix, firstname, lastname, phone, student_id, admission_year, team_id, birthday_date) VALUES
(NULL, NULL, NULL, 'ชาย', 'นาย', 'กิตติกร', 'แม่กัวะดี', '0902376913', '66310493', 2566, NULL, '2005-01-11');

-- 8. บัญชีผู้เข้าร่วม (participants)
INSERT INTO participants (participant_profile_id, email, password_hash, status) VALUES
(1, 'kittikornt01@gmail.com', '12345678', 'Active');

-- 9. ความเห็น/Feedback (feedbacks)
INSERT INTO feedbacks (participant_id, comment, rating) VALUES
(1, 'ดีมาก น่าสนใจมากโครงการนี้', 4);

-- 10. งาน/Tasks (tasks)
INSERT INTO tasks (event_id, priority_id, task_name, due_date, description, progress_percent, start_date, actual_finished_date) VALUES
(1, 3, 'Bootcamp STL', '2026-05-01 00:00:00', 
 'กิจกรรมเข้าค่ายติวเข้มที่เปลี่ยนไอเดียในกระดาษให้กลายเป็นโมเดลธุรกิจจริง ผ่านการเวิร์กชอปกับกูรูตัวจริงเพื่อปรับปรุงแผนธุรกิจ (Business Model) ฝึกฝนทักษะการนำเสนอ (Pitching) ให้มัดใจนักลงทุน',
 25, '2026-04-30 00:00:00', '2026-05-05 00:00:00');

-- 11. เอกสาร (documents)
INSERT INTO documents (doc_status_id, name, is_digital_signed, file_storage_path, file_type, file_size) VALUES
(2, 'ฟอร์มสมัครโครงการ STL', FALSE, '/storage/forms/stl_application_form.pdf', 'pdf', 512000);
