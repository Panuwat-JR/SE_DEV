// ไฟล์: src/context/AppContext.jsx
// React Context กลาง — Dashboard ดึงข้อมูลจาก Backend API, ส่วนอื่นใช้ Mock Data

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    fetchDashboardData,
    fetchActivities,
    createActivity,
    fetchTasks,
    createTask,
    fetchTeams,
    createTeam,
    fetchEmployees,
    fetchDocuments,
    createDocument,
    deleteDocument as apiDeleteDocument,
    fetchParticipants,
    createParticipant,
} from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [logs, setLogs] = useState([]);
    const [dbStats, setDbStats] = useState(null); // stats จาก DB จริง

    // ========== ดึงข้อมูลทั้งหมดจาก Backend API (แทน Mock Data) ==========
    useEffect(() => {
        const loadAllData = async () => {
            try {
                const dashboard = await fetchDashboardData();
                if (dashboard.stats) setDbStats(dashboard.stats);

                const activitiesData = await fetchActivities();
                setEvents(activitiesData);

                const tasksData = await fetchTasks();
                setTasks(tasksData);

                const teamsData = await fetchTeams();
                setTeams(teamsData);

                const employeesData = await fetchEmployees();
                setEmployees(employeesData);

                const documentsData = await fetchDocuments();
                setDocuments(documentsData);

                const participantsData = await fetchParticipants();
                setParticipants(participantsData);

            } catch (error) {
                console.error('Failed to fetch initial data from DB:', error);
            }
        };

        loadAllData();
    }, []);

    // ==================== EVENTS ====================
    const addEvent = async (data) => {
        try {
            await createActivity(data);
            // Fetch anew to get full generated data from DB
            const updatedEvents = await fetchActivities();
            setEvents(updatedEvents);
            
            // Reload dashboard stats
            const dash = await fetchDashboardData();
            if (dash.stats) setDbStats(dash.stats);

            _addLog('event', 'สร้างกิจกรรมใหม่ลง Database', data.title);
        } catch (error) {
            console.error('Error creating event:', error);
            alert('บันทึกกิจกรรมไม่สำเร็จ: ' + error.message);
        }
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
    const addTask = async (data) => {
        try {
            await createTask(data);
            const updatedTasks = await fetchTasks();
            setTasks(updatedTasks);

            const dash = await fetchDashboardData();
            if (dash.stats) setDbStats(dash.stats);

            _addLog('task', 'สร้างงานใหม่ลง Database', data.title || data.task_name);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('บันทึกงานไม่สำเร็จ: ' + error.message);
        }
    };

    const updateTask = (id, data) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // ==================== TEAMS ====================
    const addTeam = async (data) => {
        try {
            await createTeam(data);
            const updatedTeams = await fetchTeams();
            setTeams(updatedTeams);
            _addLog('team', 'สร้างทีมใหม่ลง Database', data.name);
        } catch (error) {
            console.error('Error creating team:', error);
            alert('สร้างทีมไม่สำเร็จ: ' + error.message);
        }
    };

    // ==================== DOCUMENTS ====================
    const addDocument = async (data) => {
        try {
            await createDocument(data);
            const updatedDocs = await fetchDocuments();
            setDocuments(updatedDocs);

            const dash = await fetchDashboardData();
            if (dash.stats) setDbStats(dash.stats);

            _addLog('document', 'สร้างเอกสารใหม่ลง Database', data.name);
        } catch (error) {
            console.error('Error creating document:', error);
            alert('สร้างเอกสารไม่สำเร็จ: ' + error.message);
        }
    };

    const updateDocument = (id, data) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    };

    const removeDocument = async (id) => {
        try {
            await apiDeleteDocument(id);
            const updatedDocs = await fetchDocuments();
            setDocuments(updatedDocs);

            const dash = await fetchDashboardData();
            if (dash.stats) setDbStats(dash.stats);

            _addLog('document', 'ลบเอกสาร', '');
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('ลบเอกสารไม่สำเร็จ: ' + error.message);
        }
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
    const addParticipant = async (data) => {
        try {
            await createParticipant(data);
            const updated = await fetchParticipants();
            setParticipants(updated);
            _addLog('participant', 'เพิ่มผู้เข้าร่วมลง Database', data.firstname);
        } catch (error) {
            console.error('Error creating participant:', error);
            alert('เพิ่มผู้เข้าร่วมไม่สำเร็จ: ' + error.message);
        }
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
            addDocument, updateDocument, removeDocument,
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
