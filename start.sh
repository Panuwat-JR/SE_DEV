#!/bin/bash

# ============================================================
#  NU SEED — Start Script
#  รันทั้ง Backend และ Frontend พร้อมกัน
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "  ███╗   ██╗██╗   ██╗    ███████╗███████╗███████╗██████╗ "
echo "  ████╗  ██║██║   ██║    ██╔════╝██╔════╝██╔════╝██╔══██╗"
echo "  ██╔██╗ ██║██║   ██║    ███████╗█████╗  █████╗  ██║  ██║"
echo "  ██║╚██╗██║██║   ██║    ╚════██║██╔══╝  ██╔══╝  ██║  ██║"
echo "  ██║ ╚████║╚██████╔╝    ███████║███████╗███████╗██████╔╝"
echo "  ╚═╝  ╚═══╝ ╚═════╝     ╚══════╝╚══════╝╚══════╝╚═════╝ "
echo -e "${NC}"
echo -e "${GREEN}  ระบบติดตามโครงการ มหาวิทยาลัยนเรศวร${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# ตรวจสอบว่าโฟลเดอร์มีอยู่
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}❌  ไม่พบโฟลเดอร์ backend${NC}"
  exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}❌  ไม่พบโฟลเดอร์ frontend${NC}"
  exit 1
fi

# ตั้งค่า .env สำหรับ backend ถ้ายังไม่มี
if [ ! -f "$BACKEND_DIR/.env" ]; then
  if [ -f "$BACKEND_DIR/.env.example" ]; then
    echo -e "${YELLOW}⚠️   ไม่พบ .env — กำลังสร้างจาก .env.example...${NC}"
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✅  สร้าง .env เรียบร้อย — ค่าเริ่มต้นชี้ Postgres ใน Docker ที่พอร์ต 55432${NC}"
  else
    echo -e "${YELLOW}⚠️   ไม่พบ .env และ .env.example — ข้ามไปก่อน${NC}"
  fi
fi

# PostgreSQL ใน Docker (ถ้ามี Docker) — เพื่อนใหม่ pull แล้วรันได้ทันที
if command -v docker >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
  echo ""
  echo -e "${BLUE}🐘  กำลังเริ่ม PostgreSQL (docker compose)...${NC}"
  (cd "$SCRIPT_DIR" && docker compose up -d) || echo -e "${YELLOW}⚠️   docker compose ไม่สำเร็จ — ตั้ง DATABASE_URL ใน backend/.env ให้ชี้ PostgreSQL ของคุณ${NC}"
  for _i in $(seq 1 40); do
    if (cd "$SCRIPT_DIR" && docker compose exec -T db pg_isready -U nuseed -d nuseed >/dev/null 2>&1); then
      echo -e "${GREEN}✅  Postgres พร้อมรับ connection${NC}"
      break
    fi
    sleep 1
    [ "$_i" -eq 40 ] && echo -e "${YELLOW}⚠️   รอ Postgres นานเกินไป — ลองรันใหม่หรือตรวจ Docker${NC}"
  done
fi

# ติดตั้ง dependencies
echo ""
echo -e "${BLUE}📦  กำลังติดตั้ง Backend Dependencies...${NC}"
cd "$BACKEND_DIR" && npm install --prefer-offline 2>&1 | tail -3
echo -e "${GREEN}✅  Backend พร้อมแล้ว${NC}"

# Schema + ข้อมูลเดโม (พอร์ทัลผู้เข้าร่วม / โครงการ / งาน / เอกสาร)
if [ -f "$BACKEND_DIR/.env" ]; then
  echo ""
  echo -e "${BLUE}🌱  กำลังตรวจสอบและ seed ฐานข้อมูลเดโม...${NC}"
  (cd "$BACKEND_DIR" && node scripts/init-demo-db.js) || echo -e "${YELLOW}⚠️   init-demo-db ข้ามหรือล้มเหลว — ตรวจ DATABASE_URL ใน backend/.env${NC}"
fi

echo ""
echo -e "${BLUE}📦  กำลังติดตั้ง Frontend Dependencies...${NC}"
cd "$FRONTEND_DIR" && npm install --prefer-offline 2>&1 | tail -3
echo -e "${GREEN}✅  Frontend พร้อมแล้ว${NC}"

# เก็บ PID เพื่อ cleanup
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}🛑  กำลังหยุดการทำงาน...${NC}"
  [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  echo -e "${GREEN}✅  หยุดการทำงานเรียบร้อย${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# เริ่ม Backend
echo ""
echo -e "${BLUE}🚀  กำลังเริ่ม Backend (Port 5000)...${NC}"
cd "$BACKEND_DIR" && node server.js &
BACKEND_PID=$!

sleep 1

# เริ่ม Frontend
echo -e "${BLUE}🚀  กำลังเริ่ม Frontend (Port 5173)...${NC}"
cd "$FRONTEND_DIR" && npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅  ระบบพร้อมใช้งาน!${NC}"
echo ""
echo -e "${GREEN}  🌐  Frontend:  http://localhost:5173${NC}"
echo -e "${GREEN}  🔧  Backend:   http://localhost:5000${NC}"
echo ""
echo -e "${YELLOW}  เข้าพอร์ทัลผู้เข้าร่วม: Login → ผู้เข้าร่วม → ชื่อ firstname ใช้ ปิยะ (ตรง DB)${NC}"
echo -e "${YELLOW}  Postgres (Docker): localhost:55432  user/db nuseed — รีเซ็ตข้อมูลเดโม: NU_SEED_FORCE_DEMO=1 npm run init-demo-db ใน backend${NC}"
echo ""
echo -e "${YELLOW}  กด Ctrl+C เพื่อหยุดทุกระบบ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

wait
