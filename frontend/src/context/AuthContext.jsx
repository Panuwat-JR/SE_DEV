// src/context/AuthContext.jsx
// Session: role + ข้อมูลพนักงาน (อีเมลจาก DB) สำหรับ employee/executive + participant profile
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { participantFetch, setParticipantFirstname } from '../lib/participantApi';

const AuthContext = createContext(null);

const LS_AUTH = 'nu_seed_auth_v1';

/** ข้อมูลพนักงานที่เก็บหลังล็อกอินสำเร็จ (ไม่มี secret) */
function normalizeStoredEmployee(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = Number(raw.id);
    if (!Number.isFinite(id)) return null;
    return {
        id,
        email: String(raw.email || '').trim(),
        first_name: raw.first_name != null ? String(raw.first_name) : '',
        last_name: raw.last_name != null ? String(raw.last_name) : '',
        role: raw.role != null ? String(raw.role) : '',
        department: raw.department != null ? String(raw.department) : '',
        initial: raw.initial != null ? String(raw.initial) : '',
    };
}

function readStoredAuth() {
    if (typeof localStorage === 'undefined') {
        return { role: null, employee: null, participantFirstname: null };
    }
    try {
        const raw = localStorage.getItem(LS_AUTH);
        if (!raw) return { role: null, employee: null, participantFirstname: null };
        const parsed = JSON.parse(raw);
        const r = parsed?.role;
        const role = ['participant', 'employee', 'executive'].includes(r) ? r : null;
        return {
            role,
            employee: normalizeStoredEmployee(parsed?.employee),
            participantFirstname:
                parsed?.participantFirstname != null
                    ? String(parsed.participantFirstname).trim() || null
                    : null,
        };
    } catch {
        return { role: null, employee: null, participantFirstname: null };
    }
}

export const AuthProvider = ({ children }) => {
    const initial = readStoredAuth();
    const [role, setRole] = useState(initial.role);
    const [employee, setEmployee] = useState(initial.employee);
    const [teamRole, setTeamRole] = useState('member');
    const [participantProfile, setParticipantProfile] = useState(null);
    const [participantProfileLoading, setParticipantProfileLoading] = useState(false);

    const refreshParticipantProfile = useCallback(async () => {
        setParticipantProfileLoading(true);
        try {
            const res = await participantFetch('/api/participants-data/profile');
            if (!res.ok) {
                setParticipantProfile(null);
                return;
            }
            const data = await res.json();
            setParticipantProfile(data);
            setTeamRole(data.isTeamLeader ? 'leader' : 'member');
        } catch {
            setParticipantProfile(null);
        } finally {
            setParticipantProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (role === 'participant') {
            refreshParticipantProfile();
        } else {
            setParticipantProfile(null);
            setParticipantProfileLoading(false);
        }
    }, [role, refreshParticipantProfile]);

    const login = useCallback(({ role: nextRole, employee: emp, participantFirstname: pfn }) => {
        setRole(nextRole);
        setEmployee(nextRole === 'employee' || nextRole === 'executive' ? normalizeStoredEmployee(emp) : null);
        try {
            localStorage.setItem(
                LS_AUTH,
                JSON.stringify({
                    role: nextRole,
                    employee:
                        nextRole === 'employee' || nextRole === 'executive'
                            ? normalizeStoredEmployee(emp)
                            : null,
                    participantFirstname:
                        nextRole === 'participant' && pfn ? String(pfn).trim() : null,
                })
            );
        } catch {
            /* ignore */
        }
    }, []);

    const logout = useCallback(() => {
        setRole(null);
        setEmployee(null);
        setTeamRole('member');
        setParticipantProfile(null);
        setParticipantProfileLoading(false);
        try {
            localStorage.removeItem(LS_AUTH);
        } catch {
            /* ignore */
        }
    }, []);

    /** หลังแก้ firstname ในโปรไฟล์ — อัปเดตคีย์ที่ API ใช้ + LS_AUTH */
    const syncParticipantLoginFirstname = useCallback((name) => {
        const v = String(name || '').trim();
        if (!v) return;
        setParticipantFirstname(v);
        try {
            const raw = localStorage.getItem(LS_AUTH);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.role !== 'participant') return;
            parsed.participantFirstname = v;
            localStorage.setItem(LS_AUTH, JSON.stringify(parsed));
        } catch {
            /* ignore */
        }
    }, []);

    /** หลังบันทึกโปรไฟล์พนักงาน — ซิงค์ sidebar/header */
    const mergeEmployeeSession = useCallback((partial) => {
        if (!partial || typeof partial !== 'object') return;
        setEmployee((prev) => {
            if (!prev) return prev;
            const merged = { ...prev, ...partial };
            const next = normalizeStoredEmployee(merged);
            if (!next) return prev;
            try {
                const raw = localStorage.getItem(LS_AUTH);
                const parsed = raw ? JSON.parse(raw) : {};
                parsed.employee = { ...parsed.employee, ...next };
                localStorage.setItem(LS_AUTH, JSON.stringify(parsed));
            } catch {
                /* ignore */
            }
            return next;
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                role,
                employee,
                teamRole,
                setTeamRole,
                login,
                logout,
                participantProfile,
                participantProfileLoading,
                refreshParticipantProfile,
                syncParticipantLoginFirstname,
                mergeEmployeeSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
