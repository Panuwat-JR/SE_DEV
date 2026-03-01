// ไฟล์: src/context/AppContext.jsx
// React Context กลางสำหรับ Mock Data — ทุกข้อมูลเก็บใน state เท่านั้น
// กด F5 = ข้อมูลกลับสู่ค่าเริ่มต้นเสมอ

import React, { createContext, useContext, useState } from 'react';
import {
    INITIAL_EVENTS,
    INITIAL_TASKS,
    INITIAL_TEAMS,
    INITIAL_DOCUMENTS,
    INITIAL_EMPLOYEES,
    INITIAL_PARTICIPANTS,
    INITIAL_LOGS,
} from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [teams, setTeams] = useState(INITIAL_TEAMS);
    const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
    const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
    const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
    const [logs, setLogs] = useState(INITIAL_LOGS);

    // ==================== EVENTS ====================
    const addEvent = (data) => {
        const newEvent = {
            ...data,
            id: Date.now(),
            current_participants: 0,
            status: data.status || 'เปิดรับสมัคร',
        };
        setEvents(prev => [newEvent, ...prev]);
        _addLog('event', 'สร้างกิจกรรมใหม่', newEvent.title);
    };

    const updateEvent = (id, data) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        _addLog('event', 'อัปเดตกิจกรรม', data.title || '');
    };

    const deleteEvent = (id) => {
        const ev = events.find(e => e.id === id);
        setEvents(prev => prev.filter(e => e.id !== id));
        setTasks(prev => prev.filter(t => t.event_id !== id));
        _addLog('event', 'ลบกิจกรรม', ev?.title || '');
    };

    // ==================== TASKS ====================
    const addTask = (data) => {
        const eventName = events.find(e => e.id === Number(data.event_id))?.title || 'ไม่ระบุกิจกรรม';
        const newTask = {
            ...data,
            id: Date.now(),
            title: data.task_name || data.title,
            task_name: data.task_name || data.title,
            event: eventName,
            progress: data.status === 'เสร็จสิ้น' ? 100 : data.status === 'กำลังดำเนินการ' ? 30 : 0,
            assignees: ['ส'],
        };
        setTasks(prev => [newTask, ...prev]);
        _addLog('task', 'สร้างงานใหม่', newTask.task_name);
    };

    const updateTask = (id, data) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // ==================== TEAMS ====================
    const addTeam = (data) => {
        const eventName = events.find(e => e.id === Number(data.event_id))?.title || '';
        const newTeam = {
            ...data,
            id: Date.now(),
            event: eventName,
            memberCount: data.members?.length || 0,
            docsCount: 0,
            members: data.members || [],
        };
        setTeams(prev => [...prev, newTeam]);
        _addLog('team', 'สร้างทีมใหม่', newTeam.name);
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
        total_activities: events.length,
        registered_teams: teams.length,
        total_tasks: tasks.length,
        pending_tasks: tasks.filter(t => t.status === 'รอดำเนินการ').length,
        total_documents: documents.length,
        documents_this_month: documents.length,
        active_activities: events.filter(e => e.status === 'กำลังดำเนินการ').length,
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
