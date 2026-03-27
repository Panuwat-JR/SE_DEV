-- เพิ่ม column รูปโปรไฟล์ผู้เข้าร่วม
ALTER TABLE participant_profiles
  ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT NULL;
