import { API_BASE } from '../config/api';

export const PARTICIPANT_FIRSTNAME_KEY = 'nu_seed_participant_firstname';

export function getDefaultParticipantFirstname() {
    const env =
        typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_PARTICIPANT_FIRSTNAME
            ? String(import.meta.env.VITE_DEMO_PARTICIPANT_FIRSTNAME).trim()
            : '';
    return env || 'ปิยะ';
}

export function getParticipantFirstname() {
    if (typeof localStorage === 'undefined') return getDefaultParticipantFirstname();
    return localStorage.getItem(PARTICIPANT_FIRSTNAME_KEY) || getDefaultParticipantFirstname();
}

export function setParticipantFirstname(name) {
    const v = String(name ?? '').trim();
    if (v) localStorage.setItem(PARTICIPANT_FIRSTNAME_KEY, v);
    else localStorage.removeItem(PARTICIPANT_FIRSTNAME_KEY);
}

export function participantApiUrl(path) {
    const p = path.startsWith('/') ? path : `/${path}`;
    if (!API_BASE) return p;
    return `${API_BASE}${p}`;
}

/** แปลง network error จาก fetch เป็นข้อความที่ผู้ใช้เข้าใจ */
export function getParticipantFetchErrorMessage(err, fallbackTh = 'เกิดข้อผิดพลาด') {
    const name = err?.name;
    const msg = err?.message || '';
    if (msg === 'Failed to fetch' || name === 'TypeError') {
        return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — รัน Backend คู่กับ Frontend (เช่น ./start.sh) และตั้ง VITE_DEV_API_PROXY ใน frontend/.env ให้ตรงพอร์ต Backend; ถ้าใช้ VITE_USE_FULL_API_IN_DEV=true ให้ตรวจ VITE_API_BASE ด้วย';
    }
    return msg || fallbackTh;
}

/**
 * ค่า HTTP header ต้องเป็น ISO-8859-1 เท่านั้น — ชื่อภาษาไทยต้อง encode ก่อนส่ง
 * (มิฉะนั้น browser จะ throw: Failed to execute 'set' on 'Headers'…)
 */
export function encodeParticipantFirstnameForHeader(name) {
    return encodeURIComponent(String(name ?? '').trim());
}

/** เรียก API พอร์ทัลผู้เข้าร่วม — แนบ X-Participant-Firstname (UTF-8 → percent-encoding ASCII) */
export async function participantFetch(path, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set(
        'X-Participant-Firstname',
        encodeParticipantFirstnameForHeader(getParticipantFirstname())
    );
    return fetch(participantApiUrl(path), { ...init, headers });
}
