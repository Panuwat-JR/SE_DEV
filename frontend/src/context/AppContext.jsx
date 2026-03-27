// ไฟล์: src/context/AppContext.jsx
// React Context กลาง — Dashboard ดึงข้อมูลจาก Backend API, ส่วนอื่นใช้ Mock Data

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    INITIAL_EVENTS,
    INITIAL_TASKS,
    INITIAL_TEAMS,
    INITIAL_DOCUMENTS,
    INITIAL_EMPLOYEES,
    INITIAL_PARTICIPANTS,
    INITIAL_LOGS,
} from '../data/mockData';
import { API_BASE as _API_ORIGIN } from '../config/api';

const API_BASE = `${_API_ORIGIN}/api`;

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
    const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
    const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [dbStats, setDbStats] = useState(null); // stats จาก DB จริง

    // ========== ดึง Dashboard Data จาก Backend API ==========
    useEffect(() => {
        // ดึง Dashboard stats และ Tasks logs
        fetch(`${API_BASE}/dashboard-data`)
            .then(res => res.json())
            .then(data => {
                if (data.stats) setDbStats(data.stats);
                // เราไม่ใช้ upcomingActivities จาก dashboard-data แล้ว เพราะจะดึง events ทั้งหมดจาก /api/activities แทน
                if (data.activityLogs?.length > 0) setLogs(data.activityLogs);
            })
            .catch(err => {
                console.warn('⚠️ ไม่สามารถเชื่อม API dashboard-data ได้:', err.message);
            });

        // ดึง Activities (รายการกิจกรรม) ทั้งหมด
        fetch(`${API_BASE}/activities`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setEvents(data);
                }
            })
            .catch(err => {
                console.warn('⚠️ ไม่สามารถเชื่อม API activities ได้ ใช้ Mock Data แทน:', err.message);
            });

        // ดึง Tasks ทั้งหมดสำหรับหน้า Tasks
        fetch(`${API_BASE}/tasks`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setTasks(data);
                }
            })
            .catch(err => {
                console.warn('⚠️ ไม่สามารถเชื่อม API tasks ได้ ใช้ Mock Data แทน:', err.message);
            });

        // ดึง Employees (รายชื่อพนักงาน) ทั้งหมด
        fetch(`${API_BASE}/employees`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    setEmployees(data);
                }
            })
            .catch(err => {
                console.warn('⚠️ ไม่สามารถเชื่อม API employees ได้ ใช้ Mock Data แทน:', err.message);
            });

        // ทีม — ดึงจาก DB ทั้งรายการและสมาชิก (สอดคล้องกับสถิติ dashboard)
        fetch(`${API_BASE}/teams`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data?.teamsData)) {
                    setTeams(data.teamsData);
                }
            })
            .catch(err => {
                console.warn('⚠️ ไม่สามารถเชื่อม API teams ได้ ใช้ Mock Data แทน:', err.message);
            });
    }, []);

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
                const result = await res.json();
                setEvents(prev => [...prev, { ...data, id: result.data.id }]);
                _addLog('event', 'สร้างกิจกรรมใหม่', data.title);
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
                setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
                _addLog('event', 'อัปเดตกิจกรรม', data.title || '');
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
                setEvents(prev => prev.filter(e => e.id !== id));
                _addLog('event', 'ลบกิจกรรม', deleted?.title || '');
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
                // Refresh tasks from server to get ID and correct format
                const freshTasks = await fetch(`${API_BASE}/tasks`).then(r => r.json());
                setTasks(freshTasks);
                _addLog('task', 'สร้างงานใหม่', data.title);
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
                setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
                _addLog('task', 'อัปเดตงาน', data.title || '');
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
        } catch (err) {
            console.error('addTeam Error:', err);
        }
    };

    // ==================== DOCUMENTS ====================
    const addDocument = (data) => {
        const newDoc = {
            ...data,
            id: Date.now(),
            date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
            doc_status: data.doc_status || 'ร่าง',
        };
        setDocuments(prev => [newDoc, ...prev]);
        _addLog('document', 'สร้างเอกสารใหม่', newDoc.name);
    };

    const updateDocument = (id, data) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    };

    // ==================== EMPLOYEES ====================
    const addEmployee = (data) => {
        const newEmp = {
            ...data,
            id: Date.now(),
            status: 'active',
            online_status: 'offline',
            initial: data.first_name?.charAt(0) || '?',
            color: 'bg-gray-500',
        };
        setEmployees(prev => [...prev, newEmp]);
    };

    const updateEmployee = (id, data) => {
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    };

    const deleteEmployee = (id) => {
        setEmployees(prev => prev.filter(e => e.id !== id));
    };

    // ==================== PARTICIPANTS ====================
    const addParticipant = (data) => {
        const teamName = teams.find(t => t.id === Number(data.team_id))?.name || 'ไม่ระบุทีม';
        const newP = {
            ...data,
            id: Date.now(),
            team_name: teamName,
        };
        setParticipants(prev => [...prev, newP]);
    };

    const deleteParticipant = (id) => {
        setParticipants(prev => prev.filter(p => p.id !== id));
    };

    // ==================== LOGS ====================
    const _addLog = (type, title, description) => {
        const newLog = {
            id: 'log_' + Date.now(),
            action_type: type,
            title,
            description,
            user_name: 'สมชาย สมศรี',
            time_ago: 'เมื่อสักครู่',
        };
        setLogs(prev => [newLog, ...prev].slice(0, 10));
    };

    // ==================== COMPUTED STATS ====================
    const stats = {
        total_activities: dbStats?.total_activities ?? events.length,
        registered_teams: dbStats?.registered_teams ?? teams.length,
        total_tasks: dbStats?.total_tasks ?? tasks.length,
        pending_tasks: dbStats?.pending_tasks ?? tasks.filter(t => t.status === 'รอดำเนินการ').length,
        total_documents: dbStats?.total_documents ?? documents.length,
        documents_this_month: dbStats?.documents_this_month ?? documents.length,
        active_activities: dbStats?.active_activities ?? events.filter(e => e.status === 'กำลังดำเนินการ').length,
    };

    return (
        <AppContext.Provider value={{
            // Data
            events, tasks, teams, documents, employees, participants, logs,
            // Stats
            stats,
            // Event ops
            addEvent, updateEvent, deleteEvent,
            // Task ops
            addTask, updateTask, deleteTask,
            // Team ops
            addTeam,
            // Document ops
            addDocument, updateDocument,
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
