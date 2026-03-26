-- 1. ข้อมูลระดับความสำคัญ (priority_levels)
INSERT INTO priority_levels (name, slug, description, code_color) VALUES 
('เร่งด่วนที่สุด', 'urgent', 'งานที่ต้องทำทันที เนื่องจากส่งผลกระทบต่อกำหนดการหลักอย่างวิกฤต', '#ef4444'),
('สูง', 'high', 'งานสำคัญที่ต้องดำเนินการให้เสร็จภายในวันหรือสัปดาห์ปัจจุบัน', '#f97316'),
('ปกติ', 'medium', 'งานทั่วไปที่สามารถดำเนินงานตามลำดับเวลาปกติได้', '#3b82f6'),
('ต่ำ', 'low', 'งานที่ไม่เร่งด่วน สามารถรอทำหลังงานอื่นๆ เสร็จสิ้นได้', '#94a3b8');

-- 2. ข้อมูลสถานะงาน (task_statuses)
INSERT INTO task_statuses (name, slug, description, code_color) VALUES 
('รอดำเนินการ', 'pending', 'งานที่รอมอบหมายหรือรอดำเนินการเริ่มต้น', '#94a3b8'),
('กำลังดำเนินการ', 'in_progress', 'งานที่อยู่ระหว่างการดำเนินงานโดยผู้รับผิดชอบ', '#3b82f6'),
('รอตรวจสอบ', 'under_review', 'งานที่ดำเนินการเสร็จสิ้นแล้วและอยู่ระหว่างการรออนุมัติหรือตรวจสอบ', '#f59e0b'),
('เสร็จสิ้น', 'completed', 'งานที่ได้รับการตรวจสอบและอนุมัติเรียบร้อยแล้ว', '#10b981'),
('ยกเลิก', 'cancelled', 'งานที่ถูกยกเลิกเนื่องจากความจำเป็นบางประการ', '#ef4444');

-- 3. ข้อมูลสถานะโครงการ (status_events)
INSERT INTO status_events (name, slug) VALUES 
('วางแผน', 'planning'),
('เปิดรับสมัคร', 'open_registration'),
('ปิดรับสมัคร', 'closed_registration'),
('ประกาศผล', 'announced'),
('กำลังดำเนินการ', 'in_progress'),
('เสร็จสิ้น', 'completed'),
('ยกเลิก', 'cancelled');

-- 4. ข้อมูลคณะ (faculties)
INSERT INTO faculties (name) VALUES 
-- กลุ่มวิทยาศาสตร์สุขภาพ
('คณะแพทยศาสตร์'),
('คณะพยาบาลศาสตร์'),
('คณะเภสัชศาสตร์'),
('คณะทันตแพทยศาสตร์'),
('คณะสหเวชศาสตร์'),
('คณะสาธารณสุขศาสตร์'),
('คณะวิทยาศาสตร์การแพทย์'),
-- กลุ่มวิทยาศาสตร์และเทคโนโลยี
('คณะวิศวกรรมศาสตร์'),
('คณะวิทยาศาสตร์'),
('คณะเกษตรศาสตร์ ทรัพยากรธรรมชาติและสิ่งแวดล้อม'),
('คณะสถาปัตยกรรมศาสตร์ ศิลปะและการออกแบบ'),
('คณะโลจิสติกส์และดิจิทัลซัพพลายเชน'),
('วิทยาลัยพลังงานทดแทนและสมาร์ตกริดเทคโนโลยี'),
-- กลุ่มมนุษยศาสตร์และสังคมศาสตร์
('คณะมนุษยศาสตร์'),
('คณะบริหารธุรกิจ เศรษฐศาสตร์และการสื่อสาร'),
('คณะสังคมศาสตร์'),
('คณะศึกษาศาสตร์'),
('คณะนิติศาสตร์'),
('วิทยาลัยนานาชาติ (NUIC)'),
('วิทยาลัยเพื่อการค้นคว้าระดับรากฐาน (IF)');

-- 5. ข้อมูลภาควิชาในคณะแพทยศาสตร์ (majors)
INSERT INTO majors (faculty_id, name) VALUES 
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชากุมารเวชศาสตร์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาจักษุวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาจิตเวชศาสตร์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชานิติเวชศาสตร์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาพยาธิวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชารังสีวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาวิสัญญีวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาเวชศาสตร์ครอบครัว'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาเวชศาสตร์ชุมชน'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาเวชศาสตร์ฟื้นฟู'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาศัลยศาสตร์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาโสต ศอ นาสิกวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาสูติศาสตร์-นรีเวชวิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาออร์โธปิดิกส์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะแพทยศาสตร์'), 'ภาควิชาอายุรศาสตร์'),

-- ของคณะคณะพยาบาลศาสตร์
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการพยาบาลเด็ก'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการพยาบาลมารดาและทารก'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการพยาบาลผู้ใหญ่และผู้สูงอายุ'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการการพยาบาลชุมชน'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการพยาบาลสุขภาพจิตและจิตเวช'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะพยาบาลศาสตร์'), 'กลุ่มวิชาการบริหารและพัฒนาวิชาชีพ'),

-- ของคณะคณะทันตแพทยศาสตร์
((SELECT faculty_id FROM faculties WHERE name = 'คณะทันตแพทยศาสตร์'), 'ภาควิชาชีววิทยาช่องปาก'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะทันตแพทยศาสตร์'), 'ภาควิชาทันตกรรมบูรณะ'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะทันตแพทยศาสตร์'), 'ภาควิชาทันตกรรมป้องกัน'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะทันตแพทยศาสตร์'), 'ภาควิชาทันตกรรมวินิจฉัย'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะทันตแพทยศาสตร์'), 'ภาควิชาศัลยศาสตร์ช่องปาก'),

-- คณะเภสัชศาสตร์
((SELECT faculty_id FROM faculties WHERE name = 'คณะเภสัชศาสตร์'), 'ภาควิชาเภสัชกรรมปฏิบัติ'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะเภสัชศาสตร์'), 'ภาควิชาเทคโนโลยีเภสัชกรรม'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะเภสัชศาสตร์'), 'ภาควิชาเภสัชเคมีและเภสัชเวท'),

-- คณะวิทยาศาสตร์
((SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์'), 'ภาควิชาคณิตศาสตร์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์'), 'ภาควิชาชีววิทยา'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์'), 'ภาควิชาเคมี'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์'), 'ภาควิชาฟิสิกส์'),
((SELECT faculty_id FROM faculties WHERE name = 'คณะวิทยาศาสตร์'), 'ภาควิชาวิทยการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ');
