-- สถานะอ่านการแจ้งเตือนพอร์ทัลผู้เข้าร่วม (ซิงค์ข้ามอุปกรณ์)
CREATE TABLE IF NOT EXISTS participant_notification_reads (
  participant_profile_id INT NOT NULL REFERENCES participant_profiles(participant_profile_id) ON DELETE CASCADE,
  notification_id VARCHAR(128) NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (participant_profile_id, notification_id)
);
