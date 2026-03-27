// ไฟล์: src/context/AppContext.jsx
// React Context กลาง — โหลดจาก Backend เท่านั้น (ไม่ fallback ไป mock แบบเงียบเมื่อ API ล้ม)

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { API_BASE as _API_ORIGIN } from '../config/api';

const API_BASE = `${_API_ORIGIN}/api`;

/** แจ้ง AppContext ให้รีเฟรชรายการเอกสาร + dashboard (ใช้หลังบันทึกจาก E_Documents) */
export const DOCUMENTS_CHANGED_EVENT = 'nu-seed-documents-changed';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const { employee, role, participantProfile } = useAuth();
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [logs, setLogs] = useState([]);
    const [dbStats, setDbStats] = useState(null);
    /** ข้อความเมื่อ GET /api/dashboard-data ล้ม — ให้ EmployeeLayout แสดงแบนเนอร์ */
    const [dashboardSyncError, setDashboardSyncError] = useState(null);

    const refreshDocumentsList = useCallback(async () => {
        try {
            const list = await fetch(`${API_BASE}/documents`).then((r) => r.json());
            if (Array.isArray(list)) setDocuments(list);
        } catch (err) {
            console.warn('refreshDocumentsList:', err.message);
        }
    }, []);

    const refreshDashboardPayload = useCallback(async () => {
        try {
            const data = await fetch(`${API_BASE}/dashboard-data`).then((r) => r.json());
            if (data.stats) setDbStats(data.stats);
            if (Array.isArray(data.activityLogs)) setLogs(data.activityLogs);
        } catch (err) {
            console.warn('refreshDashboardPayload:', err.message);
        }
    }, []);

    useEffect(() => {
        const onDocsChanged = () => {
            refreshDocumentsList();
            refreshDashboardPayload();
        };
        window.addEventListener(DOCUMENTS_CHANGED_EVENT, onDocsChanged);
        return () => window.removeEventListener(DOCUMENTS_CHANGED_EVENT, onDocsChanged);
    }, [refreshDocumentsList, refreshDashboardPayload]);

    // ========== ดึงข้อมูลจาก Backend — เฉพาะ workspace พนักงาน/ผู้บริหาร (ไม่ยิงชุด admin ตอนเป็นผู้เข้าร่วม) ==========
    useEffect(() => {
        if (role !== 'employee' && role !== 'executive') {
            setDashboardSyncError(null);
            setEvents([]);
            setTasks([]);
            setTeams([]);
            setDocuments([]);
            setEmployees([]);
            setParticipants([]);
            setLogs([]);
            setDbStats(null);
            return;
        }

        const safeJson = async (res) => {
            try {
                return await res.json();
            } catch {
                return null;
            }
        };

        fetch(`${API_BASE}/dashboard-data`)
            .then(async (res) => {
                const data = (await safeJson(res)) || {};
                if (!res.ok) {
                    setDashboardSyncError(
                        data?.error || data?.details || `dashboard-data HTTP ${res.status}`
                    );
                    return;
                }
                setDashboardSyncError(null);
                if (data.stats) setDbStats(data.stats);
                if (Array.isArray(data.activityLogs)) setLogs(data.activityLogs);
            })
            .catch((err) => {
                setDashboardSyncError(err?.message || 'เชื่อมต่อ dashboard-data ไม่ได้');
                console.warn('dashboard-data:', err);
            });

        fetch(`${API_BASE}/activities`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data)) setEvents(data);
                else console.warn('activities API:', res.status, data?.error);
            })
            .catch((err) => console.warn('activities fetch:', err.message));

        fetch(`${API_BASE}/tasks`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data)) setTasks(data);
                else console.warn('tasks API:', res.status, data?.error);
            })
            .catch((err) => console.warn('tasks fetch:', err.message));

        fetch(`${API_BASE}/employees`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data)) setEmployees(data);
                else console.warn('employees API:', res.status, data?.error);
            })
            .catch((err) => console.warn('employees fetch:', err.message));

        fetch(`${API_BASE}/teams`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data?.teamsData)) setTeams(data.teamsData);
                else console.warn('teams API:', res.status, data?.error);
            })
            .catch((err) => console.warn('teams fetch:', err.message));

        fetch(`${API_BASE}/participants-admin`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data)) setParticipants(data);
                else console.warn('participants-admin API:', res.status, data?.error);
            })
            .catch((err) => console.warn('participants-admin fetch:', err.message));

        fetch(`${API_BASE}/documents`)
            .then(async (res) => {
                const data = await safeJson(res);
                if (res.ok && Array.isArray(data)) setDocuments(data);
                else console.warn('documents API:', res.status, data?.error);
            })
            .catch((err) => console.warn('documents fetch:', err.message));
    }, [role]);

    const actorLabel = useCallback(() => {
        if (employee) {
            const n = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
            return n || employee.email || 'พนักงาน';
        }
        if (participantProfile?.displayName) return participantProfile.displayName;
        if (role === 'participant') return 'ผู้เข้าร่วมโครงการ';
        if (role === 'executive') return 'ผู้บริหาร';
        return 'ผู้ใช้งาน';
    }, [employee, participantProfile, role]);

    const _addLog = useCallback(
        (type, title, description) => {
            const newLog = {
                id: 'log_' + Date.now(),
                action_type: type,
                title,
                description,
                user_name: actorLabel(),
                time_ago: 'เมื่อสักครู่',
            };
            setLogs((prev) => [newLog, ...prev].slice(0, 10));
        },
        [actorLabel]
    );

    // ==================== EVENTS ====================
    // --- Activity Actions ---
    const addEvent = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const fresh = await fetch(`${API_BASE}/activities`).then(r => r.json());
                if (Array.isArray(fresh)) setEvents(fresh);
                _addLog('event', 'สร้างกิจกรรมใหม่', data.title);
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('addEvent Error:', err);
        }
    };

    const updateEvent = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/activities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const fresh = await fetch(`${API_BASE}/activities`).then(r => r.json());
                if (Array.isArray(fresh)) setEvents(fresh);
                _addLog('event', 'อัปเดตกิจกรรม', data.title || '');
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('updateEvent Error:', err);
        }
    };

    const deleteEvent = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/activities/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const deleted = events.find(e => e.id === id);
                const fresh = await fetch(`${API_BASE}/activities`).then(r => r.json());
                if (Array.isArray(fresh)) setEvents(fresh);
                _addLog('event', 'ลบกิจกรรม', deleted?.title || '');
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('deleteEvent Error:', err);
        }
    };

    // ==================== TASKS ====================
    // --- Task Actions ---
    const addTask = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const freshTasks = await fetch(`${API_BASE}/tasks`).then((r) => r.json());
                if (Array.isArray(freshTasks)) setTasks(freshTasks);
                _addLog('task', 'สร้างงานใหม่', data.title ?? data.task_name ?? '');
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('addTask Error:', err);
        }
    };

    const updateTask = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                const freshTasks = await fetch(`${API_BASE}/tasks`).then(r => r.json());
                if (Array.isArray(freshTasks)) setTasks(freshTasks);
                _addLog('task', 'อัปเดตงาน', data.title || '');
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('updateTask Error:', err);
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== id));
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            }
        } catch (err) {
            console.error('deleteTask Error:', err);
        }
    };

    // ==================== TEAMS ====================
    const addTeam = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    project_name: data.project_name || '',
                    event_id: data.event_id === '' || data.event_id == null ? null : data.event_id,
                }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('addTeam API:', payload?.error || res.status);
                return;
            }
            const fresh = await fetch(`${API_BASE}/teams`).then(r => r.json());
            if (Array.isArray(fresh.teamsData)) {
                setTeams(fresh.teamsData);
            }
            _addLog('team', 'สร้างทีมใหม่', payload?.team?.name || data.name);
            const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
            if (dash.stats) setDbStats(dash.stats);
            if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
        } catch (err) {
            console.error('addTeam Error:', err);
        }
    };

    const deleteTeam = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                const fresh = await fetch(`${API_BASE}/teams`).then(r => r.json());
                if (Array.isArray(fresh.teamsData)) setTeams(fresh.teamsData);
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
                _addLog('team', 'ลบทีม', String(id));
                return { ok: true };
            }
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('deleteTeam Error:', err);
            return { ok: false, error: err.message };
        }
    };

    // ==================== DOCUMENTS ====================
    const addDocument = async (data) => {
        const docName = data.name || `เอกสาร_${data.project || 'ไม่ระบุ'}`;
        try {
            const res = await fetch(`${API_BASE}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: docName, project: data.project }),
            });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                const list = await fetch(`${API_BASE}/documents`).then(r => r.json());
                if (Array.isArray(list)) setDocuments(list);
                _addLog('document', 'สร้างเอกสารใหม่', docName);
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
                window.dispatchEvent(new CustomEvent(DOCUMENTS_CHANGED_EVENT));
                return { ok: true };
            }
            const msg = payload?.error || `HTTP ${res.status}`;
            console.warn('addDocument API:', msg);
            return { ok: false, error: msg };
        } catch (err) {
            console.warn('addDocument Error:', err.message);
            return { ok: false, error: err.message };
        }
    };

    const updateDocument = async (id, data) => {
        try {
            const body = {};
            if (data.name != null) body.name = data.name;
            if (data.doc_status != null) body.doc_status = data.doc_status;
            if (Object.keys(body).length === 0) {
                setDocuments(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)));
                return { ok: true };
            }
            const res = await fetch(`${API_BASE}/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) return { ok: false, error: payload?.error || `HTTP ${res.status}` };
            const list = await fetch(`${API_BASE}/documents`).then(r => r.json());
            if (Array.isArray(list)) setDocuments(list);
            const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
            if (dash.stats) setDbStats(dash.stats);
            if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
            window.dispatchEvent(new CustomEvent(DOCUMENTS_CHANGED_EVENT));
            return { ok: true, row: payload };
        } catch (err) {
            console.error('updateDocument Error:', err);
            return { ok: false, error: err.message };
        }
    };

    const deleteDocument = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                const list = await fetch(`${API_BASE}/documents`).then(r => r.json());
                if (Array.isArray(list)) setDocuments(list);
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
                window.dispatchEvent(new CustomEvent(DOCUMENTS_CHANGED_EVENT));
                return { ok: true };
            }
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('deleteDocument Error:', err);
            return { ok: false, error: err.message };
        }
    };

    // ==================== EMPLOYEES (DB) ====================
    const refreshEmployees = async () => {
        try {
            const list = await fetch(`${API_BASE}/employees`).then(r => r.json());
            if (Array.isArray(list)) setEmployees(list);
        } catch (err) {
            console.warn('refreshEmployees:', err.message);
        }
    };

    const addEmployee = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    gender: data.gender || null,
                    role: data.role,
                    department: data.department,
                    email: data.email,
                    password: data.password,
                    online_status: data.online_status || 'offline',
                }),
            });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                await refreshEmployees();
                _addLog('team', 'เพิ่มพนักงาน', `${data.first_name} ${data.last_name || ''}`.trim());
                return { ok: true, row: payload };
            }
            console.error('addEmployee API:', payload?.error || res.status);
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('addEmployee Error:', err);
            return { ok: false, error: err.message };
        }
    };

    const updateEmployee = async (id, data) => {
        try {
            const res = await fetch(`${API_BASE}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                await refreshEmployees();
                _addLog('team', 'อัปเดตพนักงาน', payload?.email || String(id));
                return { ok: true, row: payload };
            }
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('updateEmployee Error:', err);
            return { ok: false, error: err.message };
        }
    };

    const deleteEmployee = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                await refreshEmployees();
                _addLog('team', 'ลบพนักงาน', String(id));
                return { ok: true };
            }
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('deleteEmployee Error:', err);
            return { ok: false, error: err.message };
        }
    };

    // ==================== PARTICIPANTS ====================
    const addParticipant = async (data) => {
        try {
            const res = await fetch(`${API_BASE}/participants-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstname: data.firstname,
                    lastname: data.lastname,
                    team_id: data.team_id === '' ? null : data.team_id,
                    faculty: data.faculty,
                    major: data.major,
                    student_id: data.student_id,
                    year_of_study: data.year_of_study,
                    phone: data.phone,
                    email: data.email,
                    type: data.type,
                }),
            });
            const payload = await res.json().catch(() => ({}));
            if (res.ok) {
                const list = await fetch(`${API_BASE}/participants-admin`).then(r => r.json());
                if (Array.isArray(list)) setParticipants(list);
                _addLog('team', 'เพิ่มผู้เข้าร่วม', `${data.firstname} ${data.lastname || ''}`.trim());
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
                return { ok: true };
            }
            const msg = payload?.error || `HTTP ${res.status}`;
            console.error('addParticipant API:', msg);
            return { ok: false, error: msg };
        } catch (err) {
            console.error('addParticipant Error:', err);
            return { ok: false, error: err.message };
        }
    };

    const deleteParticipant = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/participants-admin/${id}`, { method: 'DELETE' });
            if (res.ok) {
                const list = await fetch(`${API_BASE}/participants-admin`).then(r => r.json());
                if (Array.isArray(list)) setParticipants(list);
                const dash = await fetch(`${API_BASE}/dashboard-data`).then(r => r.json());
                if (dash.stats) setDbStats(dash.stats);
                if (Array.isArray(dash.activityLogs)) setLogs(dash.activityLogs);
                return { ok: true };
            }
            const payload = await res.json().catch(() => ({}));
            return { ok: false, error: payload?.error || `HTTP ${res.status}` };
        } catch (err) {
            console.error('deleteParticipant Error:', err);
            return { ok: false, error: err.message };
        }
    };

    // ==================== COMPUTED STATS ====================
    const stats = useMemo(() => {
        const combinedDocs =
            dbStats?.documents_combined_total != null
                ? dbStats.documents_combined_total
                : (dbStats?.total_documents ?? documents.length);
        return {
            total_activities: dbStats?.total_activities ?? events.length,
            registered_teams: dbStats?.registered_teams ?? teams.length,
            total_tasks: dbStats?.total_tasks ?? tasks.length,
            pending_tasks: dbStats?.pending_tasks ?? tasks.filter((t) => t.status === 'รอดำเนินการ').length,
            /** KPI รวม: เอกสารระบบหลัก + อัปโหลดทีม (เมื่อ backend ส่งมา) */
            total_documents: combinedDocs,
            documents_registry_count: dbStats?.total_documents ?? documents.length,
            team_documents_count: dbStats?.team_documents_count ?? 0,
            documents_this_month: dbStats?.documents_this_month ?? 0,
            active_activities: dbStats?.active_activities ?? events.filter((e) => e.status === 'กำลังดำเนินการ').length,
        };
    }, [dbStats, events, tasks, teams, documents.length]);

    return (
        <AppContext.Provider value={{
            // Data
            events, tasks, teams, documents, employees, participants, logs,
            // Stats
            stats,
            dashboardSyncError,
            // Event ops
            addEvent, updateEvent, deleteEvent,
            // Task ops
            addTask, updateTask, deleteTask,
            // Team ops
            addTeam, deleteTeam,
            // Document ops
            addDocument, updateDocument, deleteDocument,
            refreshDocumentsList, refreshDashboardPayload,
            // Employee ops
            addEmployee, updateEmployee, deleteEmployee,
            // Participant ops
            addParticipant, deleteParticipant,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
};

export default AppContext;
