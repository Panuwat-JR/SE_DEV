@echo off
chcp 65001 >nul
setlocal

echo.
echo ============================================================
echo  NU SEED — Start Script (Windows Version)
echo  รันทั้ง Backend และ Frontend พร้อมกัน
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set FRONTEND_DIR=%SCRIPT_DIR%frontend

:: ตรวจสอบโฟลเดอร์
if not exist "%BACKEND_DIR%" (
    echo [❌] ไม่พบโฟลเดอร์ backend
    exit /b 1
)
if not exist "%FRONTEND_DIR%" (
    echo [❌] ไม่พบโฟลเดอร์ frontend
    exit /b 1
)

:: ตั้งค่า .env สำหรับ backend ถ้ายังไม่มี
if not exist "%BACKEND_DIR%\.env" (
    if exist "%BACKEND_DIR%\.env.example" (
        echo [⚠️] ไม่พบ .env — กำลังสร้างจาก .env.example...
        copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
        echo [✅] สร้าง .env เรียบร้อย — กรุณาแก้ไข DATABASE_URL ก่อนใช้งานจริง
    ) else (
        echo [⚠️] ไม่พบ .env และ .env.example — ข้ามไปก่อน
    )
)

:: ติดตั้ง dependencies
echo.
echo [📦] กำลังติดตั้ง Backend Dependencies...
cd /d "%BACKEND_DIR%"
call npm install --prefer-offline

echo.
echo [📦] กำลังติดตั้ง Frontend Dependencies...
cd /d "%FRONTEND_DIR%"
call npm install --prefer-offline

:: เริ่มทำงานในหน้าต่างใหม่
echo.
echo [🚀] กำลังเริ่ม Backend (Port 5000)...
start "NU SEED Backend" cmd /c "cd /d "%BACKEND_DIR%" && node server.js"

echo [🚀] กำลังเริ่ม Frontend (Port 5173)...
start "NU SEED Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ============================================
echo   [✅] ระบบเริ่มทำงานแล้วในหน้าต่างใหม่!
echo.
echo   [🌐] Frontend:  http://localhost:5173
echo   [🔧] Backend:   http://localhost:5000
echo.
echo   ปิดหน้าต่างย่อย (สีดำ) เพื่อหยุดการทำงานของระบบ
echo ============================================
echo.

pause
