-- เพิ่มรายชื่อผู้รับผิดชอบงาน (JSON array ของสตริงชื่อแสดงผล)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_names JSONB DEFAULT '[]'::jsonb;
