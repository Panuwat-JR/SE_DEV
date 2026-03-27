-- ============================================================
-- Mock Data สำหรับ Executive Dashboard
-- ไฟล์นี้ใช้รันหลังจาก se_v2.sql + seed_data.sql เรียบร้อยแล้ว
-- ============================================================

-- ล้างข้อมูลเดิมออกก่อน (เผื่อรันซ้ำ) - ระวังลำดับตามความสัมพันธ์
DELETE FROM tasks;
DELETE FROM feedbacks;
DELETE FROM participants;
DELETE FROM participant_profiles;
DELETE FROM mapping_event_teams;
DELETE FROM teams;
DELETE FROM events;
DELETE FROM organizers;
DELETE FROM document_statuses;

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
((SELECT organizer_id FROM organizers WHERE name = 'NIA' LIMIT 1), 
 'start up thailand league 2026', 
 'เวทีประกวดแผนธุรกิจระดับอุดมศึกษาที่เปิดโอกาสให้นักศึกษารวมกลุ่มกันนำไอเดียเทคโนโลยีมาสร้างเป็นธุรกิจจริง โดยผู้ที่ผ่านการคัดเลือกจะได้รับเงินทุนสนับสนุนการทำต้นแบบ 50,000 บาท พร้อมรับการบ่มเพาะจากผู้เชี่ยวชาญเพื่อก้าวสู่การเป็นสตาร์ทอัพระดับมืออาชีพ',
 '2026-04-01 09:00:00', '2026-04-15 18:00:00', '2026-05-01 08:30:00', '2026-05-03 17:00:00', '2026-05-05 17:00:00',
 100000.00, TRUE, 5, 3, 500000.00, 2567);

-- 4. ทีม (teams)
INSERT INTO teams (name) VALUES
('Team CodeX');

-- 5. เชื่อมทีมเข้ากับโครงการ (mapping_event_teams)
INSERT INTO mapping_event_teams (event_id, team_id) VALUES
((SELECT event_id FROM events WHERE title = 'start up thailand league 2026' LIMIT 1), 
 (SELECT team_id FROM teams WHERE name = 'Team CodeX' LIMIT 1));

-- 6. โปรไฟล์ผู้เข้าร่วม (participant_profiles)
INSERT INTO participant_profiles (gender, prefix, firstname, lastname, phone_number, student_id, year_of_study, team_id, birthday_date) VALUES
('ชาย', 'นาย', 'กิตติกร', 'แม่กัวะดี', '0902376913', '66310493', 3, 
 (SELECT team_id FROM teams WHERE name = 'Team CodeX' LIMIT 1), 
 '2005-01-11');

-- 7. บัญชีผู้เข้าร่วม (participants)
INSERT INTO participants (participant_profile_id, email, password_hash, status) VALUES
((SELECT participant_profile_id FROM participant_profiles WHERE student_id = '66310493' LIMIT 1), 
 'kittikornt01@gmail.com', '12345678', 'Active');

-- 8. ความเห็น/Feedback (feedbacks)
INSERT INTO feedbacks (participant_id, comment, rating) VALUES
((SELECT participant_id FROM participants WHERE email = 'kittikornt01@gmail.com' LIMIT 1), 
 'ดีมาก น่าสนใจมากโครงการนี้', 4);

-- 9. งาน/Tasks (tasks)
INSERT INTO tasks (event_id, priority_id, task_name, due_date, description, progress_percent, start_date, actual_finished_date) VALUES
((SELECT event_id FROM events WHERE title = 'start up thailand league 2026' LIMIT 1), 
 (SELECT priority_id FROM priority_levels WHERE slug = 'medium' LIMIT 1), 
 'Bootcamp STL', '2026-05-01 00:00:00', 
 'กิจกรรมเข้าค่ายติวเข้มที่เปลี่ยนไอเดียในกระดาษให้กลายเป็นโมเดลธุรกิจจริง ผ่านการเวิร์กชอปกับกูรูตัวจริงเพื่อปรับปรุงแผนธุรกิจ (Business Model) ฝึกฝนทักษะการนำเสนอ (Pitching) ให้มัดใจนักลงทุน',
 25, '2026-04-30 00:00:00', '2026-05-05 00:00:00');

-- 10. เอกสาร (documents)
INSERT INTO documents (doc_status_id, name, is_digital_signed, file_storage_path, file_type, file_size) VALUES
((SELECT doc_status_id FROM document_statuses WHERE slug = 'pending_approval' LIMIT 1), 
 'ฟอร์มสมัครโครงการ STL', FALSE, '/storage/forms/stl_application_form.pdf', 'pdf', 512000);
