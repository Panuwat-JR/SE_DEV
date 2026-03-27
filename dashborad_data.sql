-- เติมข้อมูลให้ participant 'ปิยะ' มีทีม + mapping event + tasks (PostgreSQL)
DO $$
DECLARE
  v_team_id INT;
  v_pending_id INT;
  v_completed_id INT;
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
END $$;