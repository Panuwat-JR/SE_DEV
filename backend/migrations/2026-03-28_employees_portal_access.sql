-- แยกพอร์ทัลล็อกอิน: employee | executive (ค่าเริ่มต้น employee)
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS portal_access VARCHAR(32) NOT NULL DEFAULT 'employee';

-- บัญชีเดโม/seed ที่เป็นผู้บริหาร (พอร์ทัล Executive)
UPDATE employees SET portal_access = 'executive' WHERE LOWER(TRIM(email)) IN ('kanda@se.dev', 'exec@demo.nu.seed');
