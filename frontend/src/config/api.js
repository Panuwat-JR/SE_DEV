/**
 * Origin ของ Backend สำหรับ fetch / เปิดลิงก์ไฟล์
 * - Dev (`vite`): ใช้ค่าว่าง (same-origin) → proxy ใน vite.config.js ไปที่ VITE_DEV_API_PROXY
 *   ไม่ใช้ VITE_API_BASE จาก production/.env รวม — กัน merge จาก main แล้วพอร์ทัลผู้เข้าร่วมเชื่อมไม่ติด
 *   ถ้าต้องการยิงตรงไป backend ใน dev: ตั้ง VITE_USE_FULL_API_IN_DEV=true และ VITE_API_BASE=...
 * - Build production: VITE_API_BASE หรือ fallback http://localhost:5000
 */
function resolveApiBase() {
    const explicit =
        typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
            ? String(import.meta.env.VITE_API_BASE).replace(/\/$/, '')
            : '';

    const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
    if (isDev) {
        const useFullApi =
            String(
                typeof import.meta !== 'undefined' ? import.meta.env?.VITE_USE_FULL_API_IN_DEV : ''
            ).toLowerCase() === 'true';
        if (!useFullApi) return '';
        if (explicit) return explicit;
        return 'http://localhost:5000';
    }

    if (explicit) return explicit;
    return 'http://localhost:5000';
}

export const API_BASE = resolveApiBase();
