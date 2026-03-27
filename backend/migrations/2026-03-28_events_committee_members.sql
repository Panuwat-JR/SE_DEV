-- รายชื่อคณะกรรมการตัดสิน (หลายบรรทัด หรือคั่นด้วยบรรทัดใหม่)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS committee_members TEXT;
