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

# ลบ CRLF + ช่องว่างท้ายบรรทัดใน backend/.env (พอแก้ด้วย Notepad/Git บน Windows มักทำให้ pg เชื่อมไม่ได้)
normalize_backend_env() {
  local f="$BACKEND_DIR/.env"
  [ -f "$f" ] || return 0
  local tmp
  tmp="$(mktemp 2>/dev/null || echo "${f}.nuseed.$$")"
  tr -d '\r' < "$f" | sed 's/[[:space:]]*$//' > "$tmp" && mv "$tmp" "$f"
}

# ถ้า .env ยังชี้ DB คลาวด์เก่า (ตรวจจากโดเมนที่เคยใช้กับ hosted Postgres) — บังคับให้ใช้ Postgres ใน Docker ตาม .env.example
ensure_local_postgres_database_url() {
  local f="$BACKEND_DIR/.env"
  local ex="$BACKEND_DIR/.env.example"
  [ -f "$f" ] || return 0
  if ! grep -qE '^[[:space:]]*DATABASE_URL=' "$f" 2>/dev/null; then
    return 0
  fi
  if ! grep -qiE 'neon\.tech|neondatabase\.app|\.aws\.neon\.|neon\.aws' "$f" 2>/dev/null; then
    return 0
  fi
  local replacement=""
  if [ -f "$ex" ]; then
    replacement="$(grep -E '^[[:space:]]*DATABASE_URL=' "$ex" | head -1 | tr -d '\r' | sed 's/[[:space:]]*$//')"
  fi
  if [ -z "$replacement" ]; then
    replacement="DATABASE_URL=postgresql://nuseed:nuseed@127.0.0.1:55432/nuseed"
  fi
  local tmp
  tmp="$(mktemp 2>/dev/null || echo "${f}.nuseed.dburl.$$")"
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line//$'\r'/}"
    if [[ "$line" =~ ^[[:space:]]*DATABASE_URL= ]]; then
      echo "$replacement"
    else
      echo "$line"
    fi
  done < "$f" > "$tmp" && mv "$tmp" "$f"
  echo -e "${YELLOW}⚠️   พบ DATABASE_URL ชี้ DB คลาวด์ — แก้เป็นค่า local Postgres แล้ว (ดู backend/.env)${NC}"
}

# WSL2 + Docker Desktop: พอร์ต publish อยู่ฝั่ง Windows — จาก bash ใน WSL บางที 127.0.0.1:55432 ไม่ถึง
# ถ้าเช็ค /dev/tcp แล้วต่อไม่ได้ แต่ DATABASE_URL ชี้ 127.0.0.1/local host:55432 จะ export URL ใหม่ชี้ IP ใน resolv.conf
wsl2_fix_database_url_for_docker_desktop() {
  [ "$(uname -s)" = Linux ] || return 0
  grep -qiE 'microsoft|microsoft-standard' /proc/version 2>/dev/null || return 0
  local probe_ok=0
  if command -v timeout >/dev/null 2>&1; then
    timeout 2 bash -c 'echo >/dev/tcp/127.0.0.1/55432' 2>/dev/null && probe_ok=1
  else
    (echo >/dev/tcp/127.0.0.1/55432) 2>/dev/null && probe_ok=1
  fi
  [ "$probe_ok" -eq 1 ] && return 0
  local gw raw val
  gw="$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf 2>/dev/null)"
  [ -n "$gw" ] || return 0
  [ -f "$BACKEND_DIR/.env" ] || return 0
  raw="$(grep -E '^[[:space:]]*DATABASE_URL=' "$BACKEND_DIR/.env" | head -1 | tr -d '\r' || true)"
  [ -n "$raw" ] || return 0
  val="${raw#*DATABASE_URL=}"
  val="$(sed 's/^[[:space:]]*//;s/[[:space:]]*$//' <<< "$val")"
  val="${val//\"/}"
  val="${val//\'/}"
  [[ "$val" == postgresql://* ]] || return 0
  if [[ "$val" == *"@127.0.0.1:55432"* ]] || [[ "$val" == *"@localhost:55432"* ]]; then
    val="${val/@127.0.0.1:55432/@${gw}:55432}"
    val="${val/@localhost:55432/@${gw}:55432}"
    export DATABASE_URL="$val"
    echo -e "${YELLOW}⚠️   WSL2: 127.0.0.1:55432 ไม่ถึง Docker บน Windows — ใช้ DATABASE_URL ชี้ ${gw}:55432 (สำหรับเซสชันนี้)${NC}"
  fi
}

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

normalize_backend_env
ensure_local_postgres_database_url

# PostgreSQL ใน Docker (ถ้ามี Docker) — เพื่อนใหม่ pull แล้วรันได้ทันที
POSTGRES_READY=0
if command -v docker >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
  echo ""
  echo -e "${BLUE}🐘  กำลังเริ่ม PostgreSQL (docker compose)...${NC}"
  (cd "$SCRIPT_DIR" && docker compose up -d) || echo -e "${YELLOW}⚠️   docker compose ไม่สำเร็จ — ตั้ง DATABASE_URL ใน backend/.env ให้ชี้ PostgreSQL ของคุณ${NC}"
  for _i in $(seq 1 90); do
    if (cd "$SCRIPT_DIR" && docker compose exec -T db pg_isready -U nuseed -d nuseed >/dev/null 2>&1); then
      echo -e "${GREEN}✅  Postgres พร้อมรับ connection${NC}"
      POSTGRES_READY=1
      break
    fi
    sleep 1
    [ "$_i" -eq 90 ] && echo -e "${YELLOW}⚠️   รอ Postgres นานเกินไป — ลองรันใหม่หรือตรวจ Docker (docker compose logs db)${NC}"
  done
fi

[ "$POSTGRES_READY" -eq 1 ] && wsl2_fix_database_url_for_docker_desktop

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

# อ่านพอร์ต backend จาก .env (ค่าเริ่มต้น 5000)
read_backend_port() {
  local envf="$BACKEND_DIR/.env"
  local p="5000"
  if [ -f "$envf" ]; then
    local line
    line=$(grep -E '^[[:space:]]*PORT=' "$envf" | head -1 || true)
    if [ -n "$line" ]; then
      p="${line#*=}"
      p="${p//$'\r'/}"
      p="${p//\"/}"
      p="${p//\'/}"
      p="$(echo "$p" | tr -d '[:space:]')"
      [ -n "$p" ] || p="5000"
    fi
  fi
  printf '%s' "$p"
}

# หยุด process ที่ LISTEN พอร์ตเดียวกัน — ป้องกัน node เก่าค้าง (ไม่มี route /documents /team → 404)
free_listen_port() {
  local port="$1"
  command -v lsof >/dev/null 2>&1 || return 0
  local pids
  pids=$(lsof -ti:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}⚠️   พอร์ต ${port} ถูกใช้งาน — หยุด process เดิมเพื่อให้ backend โหลด route ล่าสุด${NC}"
    echo "$pids" | xargs -r kill 2>/dev/null || kill $pids 2>/dev/null || true
    sleep 0.5
  fi
}

BACKEND_PORT="$(read_backend_port)"
free_listen_port "$BACKEND_PORT"

# เริ่ม Backend
echo ""
echo -e "${BLUE}🚀  กำลังเริ่ม Backend (Port ${BACKEND_PORT})...${NC}"
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
echo -e "${GREEN}  🔧  Backend:   http://localhost:${BACKEND_PORT}${NC}"
echo ""
echo -e "${BLUE}  ── ล็อกอินแยกพอร์ทัล (actor) + รหัสผ่านเดโม ──${NC}"
echo -e "  ${YELLOW}รหัสผ่านเดโมทุกบัญชี:${NC} password123"
echo ""
echo -e "  ${BLUE}ผู้เข้าร่วมโครงการ${NC}  → หลังล็อกอิน: /participant/*"
echo -e "    • firstname: ${YELLOW}ปิยะ${NC} (หรือ สมหญิง) — ตรง participant_profiles"
echo -e "    • บัญชีเดโม: piya@demo.nu.seed / somying@demo.nu.seed (อ้างอิง DB)"
echo ""
echo -e "  ${BLUE}ผู้รับผิดชอบโครงการ (พนักงาน)${NC}  → /employee/*"
echo -e "    • อีเมล: ${YELLOW}somchai@demo.nu.seed${NC} หรือ ${YELLOW}anucha@demo.nu.seed${NC}"
echo -e "    • บัญชี employee_seed: wilaiwan@se.dev, nipa@se.dev, … (รหัสเดียวกัน)"
echo ""
echo -e "  ${BLUE}ผู้บริหาร (Executive)${NC}  → /executive/*"
echo -e "    • เดโม init-db: ${YELLOW}exec@demo.nu.seed${NC}"
echo -e "    • หลังรัน employee_seed.sql: ${YELLOW}kanda@se.dev${NC} (portal_access = executive)"
echo ""
echo -e "${BLUE}  ── สิ่งที่ยังไม่ครบ \"production full\" (ภาพรวม) ──${NC}"
echo -e "  • API ส่วนใหญ่ยังไม่มี JWT/session ฝั่งเซิร์ฟเวอร์ — ใครรู้ URL ยังเรียก REST ได้"
echo -e "  • เซสชันหน้าเว็บเก็บใน localStorage (role + ข้อมูลผู้ใช้) — รีเฟรชแล้วยังอยู่ แต่ไม่ใช่ token ฝั่งเซิร์ฟเวอร์"
echo -e "  • ผู้เข้าร่วมยืนยันด้วย firstname + รหัสผ่านบัญชี participants — ชื่อซ้ำใน DB อาจชนกัน"
echo ""
echo -e "${YELLOW}  Postgres (Docker): localhost:55432  user/db nuseed${NC}"
echo -e "${YELLOW}  รีเซ็ตเดโม: cd backend && NU_SEED_FORCE_DEMO=1 npm run init-demo-db${NC}"
echo ""
echo -e "${YELLOW}  กด Ctrl+C เพื่อหยุดทุกระบบ${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

wait
