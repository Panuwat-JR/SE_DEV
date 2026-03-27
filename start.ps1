# NU SEED — Start script for Windows (PowerShell)
# เทียบเท่า start.sh: Docker Postgres → npm install → seed → backend + frontend
#
# รัน: เปิด PowerShell ที่โฟลเดอร์โปรเจกต์ แล้ว
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # ครั้งเดียวถ้ายังรัน script ไม่ได้
#   .\start.ps1
#
# DB เชื่อมไม่ได้ — เช็คตามนี้:
#   1) เปิด Docker Desktop ให้รอจนพร้อม แล้วรัน: docker compose up -d (จากโฟลเดอร์นี้)
#   2) backend\.env ต้องมี DATABASE_URL=postgresql://nuseed:nuseed@127.0.0.1:55432/nuseed
#      (ใช้ 127.0.0.1 ดีกว่า localhost; ถ้าแก้ใน Notepad ให้บันทึกเป็น UTF-8)
#   3) ถ้าใช้ Node ใน WSL แต่ Docker บน Windows — พอร์ต 55432 อาจไม่ถึงจาก WSL;
#      ให้รัน backend บน Windows ผ่าน .\start.ps1 หรือตั้ง DATABASE_URL ชี้ IP ของ Windows host

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "backend"
$FrontendDir = Join-Path $ScriptDir "frontend"

Write-Host ""
Write-Host "  NU SEED — ระบบติดตามโครงการ (Windows)" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $BackendDir)) { Write-Host "ไม่พบโฟลเดอร์ backend" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $FrontendDir)) { Write-Host "ไม่พบโฟลเดอร์ frontend" -ForegroundColor Red; exit 1 }

$envExample = Join-Path $BackendDir ".env.example"
$envFile = Join-Path $BackendDir ".env"
if (-not (Test-Path $envFile)) {
  if (Test-Path $envExample) {
    Write-Host "สร้าง backend\.env จาก .env.example..." -ForegroundColor Yellow
    Copy-Item $envExample $envFile
    Write-Host "OK — ค่าเริ่มต้นชี้ Postgres ที่พอร์ต 55432" -ForegroundColor Green
  } else {
    Write-Host "ไม่พบ .env และ .env.example" -ForegroundColor Yellow
  }
}

$composeFile = Join-Path $ScriptDir "docker-compose.yml"
if (Get-Command docker -ErrorAction SilentlyContinue) {
  if (Test-Path $composeFile) {
    Write-Host "กำลังเริ่ม PostgreSQL (docker compose)..." -ForegroundColor Cyan
    Push-Location $ScriptDir
    try {
      docker compose up -d 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) { throw "docker compose failed" }
    } catch {
      Write-Host "docker compose ไม่สำเร็จ — ตรวจ Docker Desktop และตั้ง DATABASE_URL ใน backend\.env" -ForegroundColor Yellow
    }
    $ready = $false
    for ($i = 1; $i -le 40; $i++) {
      docker compose exec -T db pg_isready -U nuseed -d nuseed 2>&1 | Out-Null
      if ($LASTEXITCODE -eq 0) { $ready = $true; break }
      Start-Sleep -Seconds 1
    }
    if ($ready) { Write-Host "Postgres พร้อมรับ connection" -ForegroundColor Green }
    else { Write-Host "รอ Postgres นานเกินไป — ลอง docker compose logs db" -ForegroundColor Yellow }
    Pop-Location
  }
} else {
  Write-Host "ไม่พบ docker ใน PATH — ติดตั้ง Docker Desktop หรือตั้ง DATABASE_URL ชี้ Postgres ของคุณ" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "กำลังติดตั้ง Backend dependencies..." -ForegroundColor Cyan
Push-Location $BackendDir
npm install --prefer-offline
if (Test-Path $envFile) {
  Write-Host ""
  Write-Host "กำลัง seed ฐานข้อมูลเดโม..." -ForegroundColor Cyan
  node scripts/init-demo-db.js
  if ($LASTEXITCODE -ne 0) {
    Write-Host "init-demo-db ล้มเหลว — ตรวจ DATABASE_URL ใน backend\.env และว่า Postgres รันที่พอร์ต 55432" -ForegroundColor Yellow
  }
}
Pop-Location

Write-Host ""
Write-Host "กำลังติดตั้ง Frontend dependencies..." -ForegroundColor Cyan
Push-Location $FrontendDir
npm install --prefer-offline
Pop-Location

function Get-BackendPort {
  $default = 5000
  if (-not (Test-Path $envFile)) { return $default }
  $line = Get-Content $envFile -Encoding UTF8 | Where-Object { $_ -match '^\s*PORT=' } | Select-Object -First 1
  if (-not $line) { return $default }
  $p = ($line -replace '^\s*PORT=', '').Trim().Trim('"').Trim("'") -replace "`r", ""
  if ([string]::IsNullOrWhiteSpace($p)) { return $default }
  return $p
}

$backendPort = Get-BackendPort
try {
  $conns = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue
  if ($conns) {
    Write-Host "พอร์ต $backendPort ถูกใช้งาน — ปิด Node/process เดิมก่อน" -ForegroundColor Yellow
  }
} catch { }

Write-Host ""
Write-Host "กำลังเปิดหน้าต่าง Backend (พอร์ต $backendPort) และ Frontend (5173)..." -ForegroundColor Cyan
Start-Process powershell -WorkingDirectory $BackendDir -ArgumentList "-NoExit", "-Command", "node server.js"
Start-Sleep -Milliseconds 800
Start-Process powershell -WorkingDirectory $FrontendDir -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ระบบพร้อมใช้งาน" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173"
Write-Host "  Backend:   http://localhost:$backendPort"
Write-Host ""
Write-Host "  Postgres (Docker): 127.0.0.1:55432  user/password/db: nuseed" -ForegroundColor Yellow
Write-Host "  หยุด: ปิดหน้าต่าง PowerShell ที่รัน node / npm run dev" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "กด Enter เพื่อปิดหน้าต่างนี้ (Backend/Frontend ยังรันต่อในหน้าต่างอื่น)" -ForegroundColor DarkGray
[void][System.Console]::ReadLine()
