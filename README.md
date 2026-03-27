# SE_DEV (NU SEED)

โปรเจกต์ใช้ **PostgreSQL ในเครื่องผ่าน Docker** เท่านั้น — ไม่ใช้ฐานข้อมูลคลาวด์ภายนอกใน repo

## เริ่มครั้งแรกหลัง `git pull`

1. ติดตั้ง [Docker](https://docs.docker.com/get-docker/) และ Node.js (LTS)
2. จาก root โปรเจกต์: `./start.sh`
   - สร้าง `backend/.env` จาก `backend/.env.example` ถ้ายังไม่มี
   - ถ้า `DATABASE_URL` ใน `.env` ยังเป็นค่า DB คลาวด์เก่า สคริปต์จะแก้ให้ชี้ Postgres ใน Docker อัตโนมัติ
   - `docker compose up -d` → รอ DB พร้อม → รัน `init-demo-db` (schema + migration + ข้อมูลเดโม)
   - ติดตั้ง npm และสตาร์ท backend + frontend

3. รีเซ็ตข้อมูลเดโม: ในโฟลเดอร์ `backend` รัน `NU_SEED_FORCE_DEMO=1 npm run init-demo-db`

รายละเอียดพอร์ตและตัวแปรเพิ่มเติมอยู่ใน `backend/.env.example` และ `frontend/.env.example`
