/**
 * Origin ของ Backend สำหรับ fetch / เปิดลิงก์ไฟล์
 * - Dev: ถ้าไม่ตั้ง VITE_API_BASE จะใช้ค่าว่าง (same-origin) ให้ Vite proxy ส่งต่อไป backend — ดู vite.config.js
 * - Build production: ตั้ง VITE_API_BASE=https://api.example.com หรือจะได้ fallback localhost:5000
 */
function resolveApiBase() {
    const explicit =
        typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
            ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '')
            : '';
    if (explicit) return explicit;
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) return '';
    return 'http://localhost:5000';
}

export const API_BASE = resolveApiBase();
