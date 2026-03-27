// pages/employee/E_Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, AlertCircle, Clock, TrendingUp, Users, FileText, ChevronRight, Calendar } from 'lucide-react';

import { useApp } from '../../context/AppContext';

export default function E_Dashboard() {
    const { events, tasks } = useApp();

    const PROJECTS = events.map(e => {
        const eventTasks = tasks.filter(t => t.event_id === e.id);
        const tasksCount = eventTasks.length;
        const tasksDoneCount = eventTasks.filter(t => t.status === 'เสร็จสิ้น').length;
        const progress = tasksCount > 0 ? Math.round((tasksDoneCount / tasksCount) * 100) : 0;
        
        return {
            id: e.id,
            title: e.title,
            status: e.status,
            statusColor: 
                e.status === 'กำลังดำเนินการ' ? 'yellow' : 
                e.status === 'เปิดรับสมัคร' ? 'blue' : 
                e.status === 'ดำเนินการสำเร็จ' || e.status === 'เสร็จสิ้น' ? 'emerald' : 
                e.status === 'วางแผน' ? 'purple' : 'gray',
            teams: e.current_participants || 0,
            participants: e.current_participants || 0,
            tasks: tasksCount,
            tasksDone: tasksDoneCount,
            issues: 0, // ปัญหายังไม่มี field ใน DB
            deadline: e.event_end || 'ไม่ระบุ',
            progress: progress,
        };
    });

    const URGENT_TASKS = tasks
        .filter(t => t.priority === 'สูง' || t.priority === 'ด่วนมาก')
        .slice(0, 5)
        .map(t => ({
            id: t.id,
            name: t.title || t.task_name,
            project: t.event,
            priority: t.priority,
            deadline: t.due_date || t.date || 'วันนี้'
        }));

    const totalProjects = PROJECTS.length;
    const activeProjects = PROJECTS.filter(p => p.status === 'กำลังดำเนินการ').length;
    const totalParticipants = PROJECTS.reduce((s, p) => s + p.participants, 0);
    const totalIssues = PROJECTS.reduce((s, p) => s + p.issues, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
                <p className="text-gray-500 text-sm mt-1">ภาพรวมโครงการทั้งหมดที่คุณรับผิดชอบ</p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'โครงการทั้งหมด', value: totalProjects, icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50/50 hover:bg-blue-50', borderColor: 'border-blue-100' },
                    { label: 'กำลังดำเนินการ', value: activeProjects, icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50/50 hover:bg-emerald-50', borderColor: 'border-emerald-100' },
                    { label: 'ผู้เข้าร่วมรวม', value: totalParticipants, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50/50 hover:bg-purple-50', borderColor: 'border-purple-100' },
                    { label: 'ปัญหาที่รอแก้', value: totalIssues, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50/50 hover:bg-red-50', borderColor: 'border-red-100' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className={`${kpi.bgColor} rounded-2xl border ${kpi.borderColor} p-5 flex flex-col relative overflow-hidden group transition-colors cursor-pointer`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border ${kpi.borderColor} transition-colors`}>
                                    <Icon size={18} className={kpi.color} />
                                </div>
                            </div>
                            <div>
                                <div className={`text-3xl font-bold text-gray-900 mb-1`}>{kpi.value}</div>
                                <div className={`${kpi.color} text-xs font-bold uppercase tracking-wider`}>{kpi.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Project table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-sm">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">โครงการทั้งหมด ({totalProjects})</h2>
                    <Link to="/employee/activities" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                        จัดการโครงการ <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-4">โครงการ</th>
                                <th className="px-5 py-4">สถานะ</th>
                                <th className="px-5 py-4 text-center">ทีม</th>
                                <th className="px-5 py-4 text-center">งาน</th>
                                <th className="px-5 py-4">ความคืบหน้า</th>
                                <th className="px-5 py-4 text-center">ปัญหา</th>
                                <th className="px-5 py-4">กำหนด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                            {[...PROJECTS].sort((a, b) => b.issues - a.issues).map(proj => {
                                const hasIssue = proj.issues > 0;
                                return (
                                <tr key={proj.id} className={`transition-colors group ${hasIssue ? 'bg-red-50/40 hover:bg-red-50/80 border-red-100/50' : 'hover:bg-gray-50/50'}`}>
                                    <td className="px-5 py-4">
                                        <Link to={`/employee/activities/${proj.id}`} className={`font-bold transition-colors ${hasIssue ? 'text-red-900 group-hover:text-red-700' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                            {proj.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-${proj.statusColor}-500`} />
                                            <span className="text-gray-700 font-medium text-xs">{proj.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center font-medium">{proj.teams}</td>
                                    <td className="px-5 py-4 text-center font-medium">
                                        <span className={proj.tasksDone === proj.tasks ? "text-gray-400" : "text-gray-900"}>{proj.tasksDone}</span><span className="text-gray-400">/{proj.tasks}</span>
                                    </td>
                                    <td className="px-5 py-4 w-48">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-gray-300' : (hasIssue ? 'bg-red-400' : 'bg-gray-800')}`} style={{ width: `${proj.progress}%` }} />
                                            </div>
                                            <span className={`text-xs font-medium shrink-0 w-8 ${hasIssue ? 'text-red-600' : 'text-gray-500'}`}>{proj.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {proj.issues > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-bold bg-white px-2 py-1 rounded-lg shadow-sm border border-red-100">
                                                <AlertCircle size={14} className="animate-pulse" /> {proj.issues}
                                            </span>
                                        ) : <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className={`px-5 py-4 text-xs font-medium flex items-center gap-2 ${hasIssue ? 'text-red-500' : 'text-gray-500'}`}>
                                        {proj.deadline}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Urgent tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={16} className="text-gray-400" /> งานเร่งด่วน</h2>
                    <Link to="/employee/tasks" className="text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด →</Link>
                </div>
                <div className="space-y-2">
                    {URGENT_TASKS.map(task => {
                        const isHigh = task.priority === 'สูง';
                        const style = isHigh ? 'border-l-red-300 bg-red-50/40 hover:bg-red-50/80' : 'border-l-amber-300 bg-amber-50/40 hover:bg-amber-50/80';
                        const text = isHigh ? 'text-red-700' : 'text-amber-700';

                        return (
                        <div key={task.id} className={`group flex items-center gap-4 py-3 border-l-4 ${style} rounded-r-xl px-4 transition-colors`}>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">{task.name}</p>
                                <p className={`text-xs ${text} mt-0.5 font-medium`}>{task.project}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${isHigh ? 'text-red-500' : 'text-amber-500'}`}>
                                    {isHigh ? 'ด่วนมาก' : 'ปานกลาง'}
                                </span>
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                    {task.deadline}
                                </span>
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );
}
