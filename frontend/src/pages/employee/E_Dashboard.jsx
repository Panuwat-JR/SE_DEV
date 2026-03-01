// pages/employee/E_Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, AlertCircle, Clock, TrendingUp, Users, FileText, ChevronRight, Calendar } from 'lucide-react';

const PROJECTS = [
    { id: 1, title: 'Startup Thailand League 2026', status: 'กำลังดำเนินการ', statusColor: 'bg-emerald-100 text-emerald-700', teams: 12, participants: 48, tasks: 8, tasksDone: 5, issues: 1, deadline: '30 มี.ค. 2569', progress: 65 },
    { id: 2, title: 'ELP Batch 5 — Naresuan', status: 'เปิดรับสมัคร', statusColor: 'bg-blue-100 text-blue-700', teams: 6, participants: 32, tasks: 5, tasksDone: 1, issues: 0, deadline: '5 เม.ย. 2569', progress: 20 },
    { id: 3, title: 'Innovation Challenge 2026', status: 'ดำเนินการสำเร็จ', statusColor: 'bg-gray-100 text-gray-600', teams: 8, participants: 36, tasks: 6, tasksDone: 6, issues: 0, deadline: 'เสร็จสิ้น', progress: 100 },
    { id: 4, title: 'NU Hackathon 48hrs', status: 'วางแผน', statusColor: 'bg-purple-100 text-purple-700', teams: 0, participants: 0, tasks: 3, tasksDone: 0, issues: 0, deadline: '20 พ.ค. 2569', progress: 5 },
    { id: 5, title: 'Pitching Bootcamp', status: 'วางแผน', statusColor: 'bg-purple-100 text-purple-700', teams: 0, participants: 0, tasks: 4, tasksDone: 0, issues: 0, deadline: '15 เม.ย. 2569', progress: 10 },
    { id: 6, title: 'NU Startup Demo Day', status: 'เปิดรับสมัคร', statusColor: 'bg-blue-100 text-blue-700', teams: 3, participants: 15, tasks: 5, tasksDone: 2, issues: 1, deadline: '10 มิ.ย. 2569', progress: 35 },
];

const URGENT_TASKS = [
    { id: 1, name: 'อนุมัติเอกสาร Pitch Deck ทีม GreenBridge', project: 'Startup Thailand', priority: 'สูง', deadline: 'วันนี้' },
    { id: 2, name: 'ยืนยันสถานที่จัดงาน Demo Day', project: 'NU Startup Demo Day', priority: 'สูง', deadline: 'พรุ่งนี้' },
    { id: 3, name: 'จัดทำเอกสารเบิกค่าสถานที่', project: 'ELP Batch 5', priority: 'ปานกลาง', deadline: '15 มี.ค.' },
];

export default function E_Dashboard() {
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
                    { label: 'โครงการทั้งหมด', value: totalProjects, icon: Activity, color: 'bg-blue-50 text-blue-600', numColor: 'text-blue-700' },
                    { label: 'กำลังดำเนินการ', value: activeProjects, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', numColor: 'text-emerald-700' },
                    { label: 'ผู้เข้าร่วมรวม', value: totalParticipants, icon: Users, color: 'bg-purple-50 text-purple-600', numColor: 'text-purple-700' },
                    { label: 'ปัญหาที่รอแก้', value: totalIssues, icon: AlertCircle, color: 'bg-red-50 text-red-600', numColor: 'text-red-600' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${kpi.numColor}`}>{kpi.value}</div>
                            <div className="text-gray-500 text-sm mt-1">{kpi.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Project table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">โครงการทั้งหมด ({totalProjects})</h2>
                    <Link to="/employee/activities" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                        จัดการโครงการ <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-3 text-left">โครงการ</th>
                                <th className="px-5 py-3 text-left">สถานะ</th>
                                <th className="px-5 py-3 text-center">ทีม</th>
                                <th className="px-5 py-3 text-center">งาน</th>
                                <th className="px-5 py-3 text-left">ความคืบหน้า</th>
                                <th className="px-5 py-3 text-center">ปัญหา</th>
                                <th className="px-5 py-3 text-left">กำหนด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                            {PROJECTS.map(proj => (
                                <tr key={proj.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <Link to={`/employee/activities/${proj.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                            {proj.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${proj.statusColor}`}>{proj.status}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center text-sm font-medium">{proj.teams}</td>
                                    <td className="px-5 py-3.5 text-center text-sm font-medium">
                                        <span className="text-emerald-600">{proj.tasksDone}</span>/<span>{proj.tasks}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-gray-400' : 'bg-blue-500'}`} style={{ width: `${proj.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0">{proj.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        {proj.issues > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                <AlertCircle size={10} /> {proj.issues} ปัญหา
                                            </span>
                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-400" /> {proj.deadline}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Urgent tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={18} className="text-amber-500" /> งานเร่งด่วน</h2>
                    <Link to="/employee/tasks" className="text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด →</Link>
                </div>
                <div className="space-y-3">
                    {URGENT_TASKS.map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'สูง' ? 'bg-red-500' : 'bg-amber-500'}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{task.name}</p>
                                <p className="text-xs text-gray-500">{task.project}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${task.deadline === 'วันนี้' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {task.deadline}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
