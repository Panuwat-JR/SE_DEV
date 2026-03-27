-- ข้อความจากผู้เข้าร่วมถึงเจ้าหน้าที่ (โหมดสาธิต / จนกว่าจะมี auth จริง)
CREATE TABLE IF NOT EXISTS participant_contact_messages (
  id SERIAL PRIMARY KEY,
  demo_participant_firstname VARCHAR(100) NOT NULL,
  employee_id INT REFERENCES employees(employee_id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
