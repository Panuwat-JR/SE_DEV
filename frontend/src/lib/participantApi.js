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
    return `${API_BASE}${p}`;
}

/** เรียก API พอร์ทัลผู้เข้าร่วม — แนบ X-Participant-Firstname ให้ตรงกับ participant_profiles.firstname */
export async function participantFetch(path, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('X-Participant-Firstname', getParticipantFirstname());
    return fetch(participantApiUrl(path), { ...init, headers });
}
