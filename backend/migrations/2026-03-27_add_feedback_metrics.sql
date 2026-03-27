-- Migration: Add rating and category to feedbacks table
-- เพื่อให้เพื่อนที่รัน se_v2.sql ไปแล้ว สามารถรันไฟล์นี้เพื่ออัปเดตได้ทันที

ALTER TABLE feedbacks 
ADD COLUMN IF NOT EXISTS rating INT CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE events
ADD COLUMN IF NOT EXISTS academic_year INT;

-- หมายเหตุ: ข้อมูลเก่าที่เคยมีอยู่แล้วจะเป็น NULL ในคอลัมน์ใหม่นี้ครับ
