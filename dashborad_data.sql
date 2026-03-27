-- เติมข้อมูลให้ participant 'ปิยะ' มีทีม + mapping event + tasks (PostgreSQL)
-- รันหลังมี schema (se.sql) แล้ว — เติมทีม/งาน/เอกสารตัวอย่างให้พอร์ทัลผู้เข้าร่วม
-- ชุดข้อมูลเต็มแนะนำ: cd backend && npm run init-demo-db
DO $$
DECLARE
  v_team_id INT;
  v_pending_id INT;
  v_completed_id INT;
  v_task_id INT;
  v_doc_status_id INT;
  v_doc_id INT;
  r RECORD;
BEGIN
  -- 1) สร้างทีม (ถ้ายังไม่มี)
  INSERT INTO teams (name)
  SELECT 'Global Seekers'
  WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Global Seekers');

  SELECT team_id INTO v_team_id
  FROM teams
  WHERE name = 'Global Seekers'
  LIMIT 1;

  -- 2) ผูก participant_profiles.firstname='ปิยะ' ให้มี team_id (ถ้า team_id ยังเป็น null)
  UPDATE participant_profiles
  SET team_id = v_team_id
  WHERE firstname = 'ปิยะ'
    AND team_id IS NULL;

  -- 3) ensure task statuses ที่จำเป็น (ถ้าไม่มี)
  INSERT INTO task_statuses (slug)
  SELECT 'pending'
  WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE slug = 'pending');

  INSERT INTO task_statuses (slug)
  SELECT 'completed'
  WHERE NOT EXISTS (SELECT 1 FROM task_statuses WHERE slug = 'completed');

  SELECT status_task_id INTO v_pending_id FROM task_statuses WHERE slug = 'pending' LIMIT 1;
  SELECT status_task_id INTO v_completed_id FROM task_statuses WHERE slug = 'completed' LIMIT 1;

  -- 4) mapping ทีมกับ events ที่มีอยู่ (เอา 3 อีเวนต์ล่าสุด) ถ้ายังไม่ถูก map
  FOR r IN
    SELECT event_id
    FROM events
    ORDER BY event_id DESC
    LIMIT 3
  LOOP
    INSERT INTO mapping_event_teams (event_id, team_id)
    SELECT r.event_id, v_team_id
    WHERE NOT EXISTS (
      SELECT 1 FROM mapping_event_teams
      WHERE event_id = r.event_id AND team_id = v_team_id
    );

    -- 5) เติม tasks ให้ event นั้นๆ (ถ้ายังไม่มี task เลย)
    IF NOT EXISTS (SELECT 1 FROM tasks WHERE event_id = r.event_id) THEN
      INSERT INTO tasks (event_id, task_name, status_task_id, due_date)
      VALUES
        (r.event_id, 'กรอกใบสมัครและข้อมูลเบื้องต้น', v_completed_id, CURRENT_DATE - INTERVAL '7 days'),
        (r.event_id, 'เตรียมเอกสาร/ไฟล์ที่เกี่ยวข้อง', v_pending_id,  CURRENT_DATE + INTERVAL '7 days'),
        (r.event_id, 'ส่งผลงาน/สรุปความคืบหน้า',      v_pending_id,  CURRENT_DATE + INTERVAL '14 days');
    END IF;
  END LOOP;

  -- 6) แถว participants สำหรับปิยะ (หน้า /participant/team ดึงสมาชิกผ่าน JOIN participants)
  INSERT INTO participants (participant_profile_id, email, password_hash, status)
  SELECT pp.participant_profile_id, 'piya@seed.local', '$2b$10$demo.hash.placeholder', 'active'
  FROM participant_profiles pp
  WHERE pp.team_id = v_team_id
    AND TRIM(pp.firstname) ILIKE '%' || TRIM('ปิยะ') || '%'
    AND NOT EXISTS (
      SELECT 1 FROM participants p WHERE p.participant_profile_id = pp.participant_profile_id
    )
  LIMIT 1;

  -- 7) สถานะเอกสาร + เอกสารตัวอย่างผูกงาน (หน้า /participant/documents)
  INSERT INTO document_statuses (name, slug)
  SELECT 'ร่าง', 'draft'
  WHERE NOT EXISTS (SELECT 1 FROM document_statuses WHERE slug = 'draft');
  INSERT INTO document_statuses (name, slug)
  SELECT 'อนุมัติแล้ว', 'approved'
  WHERE NOT EXISTS (SELECT 1 FROM document_statuses WHERE slug = 'approved');

  SELECT t.task_id INTO v_task_id
  FROM tasks t
  INNER JOIN mapping_event_teams m ON m.event_id = t.event_id AND m.team_id = v_team_id
  ORDER BY t.task_id ASC
  LIMIT 1;

  IF v_task_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM documents d
      JOIN mapping_doc_tasks mdt ON mdt.document_id = d.document_id
      WHERE mdt.task_id = v_task_id
        AND d.name = 'เอกสารเดโม (dashborad_data)'
    ) THEN
      SELECT doc_status_id INTO v_doc_status_id
      FROM document_statuses
      WHERE slug = 'draft'
      LIMIT 1;

      INSERT INTO documents (doc_status_id, name, file_type, file_size, generation_status)
      VALUES (
        v_doc_status_id,
        'เอกสารเดโม (dashborad_data)',
        'application/pdf',
        48000,
        'registered'
      )
      RETURNING document_id INTO v_doc_id;

      INSERT INTO mapping_doc_tasks (task_id, document_id)
      VALUES (v_task_id, v_doc_id);
    END IF;
  END IF;
END $$;