// pages/employee/E_Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, Clock, TrendingUp, Users, ChevronRight, Calendar } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function E_Dashboard() {
    const { employee } = useAuth();
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalParticipants: 0,
        totalPendingTasks: 0,
        totalIssues: 0,
    });
    const [projects, setProjects] = useState([]);
    const [urgentTasks, setUrgentTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const id = employee?.id;
        const q =
            id != null && Number.isFinite(Number(id))
                ? `?employee_id=${encodeURIComponent(String(id))}`
                : '';
        const root = API_BASE ? `${API_BASE}/api` : '/api';
        fetch(`${root}/employees/dashboard${q}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                setStats(data.stats || {});
                setProjects(data.projects || []);
                setUrgentTasks(data.urgentTasks || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [employee?.id]);

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-xl w-40" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-gray-600 font-semibold">ไม่สามารถโหลดข้อมูลได้</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
                <p className="text-gray-500 text-sm mt-1">
                    โครงการที่คุณได้รับมอบหมายในระบบ (จากตารางเชื่อมพนักงาน–โครงการ)
                </p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'โครงการทั้งหมด', value: Number(stats.totalProjects) || 0,    icon: Activity,    color: 'bg-blue-50 text-blue-600',     numColor: 'text-blue-700' },
                    { label: 'กำลังดำเนินการ', value: Number(stats.activeProjects) || 0,   icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-600', numColor: 'text-emerald-700' },
                    { label: 'ผู้เข้าร่วมรวม', value: Number(stats.totalParticipants) || 0, icon: Users,       color: 'bg-purple-50 text-purple-600',  numColor: 'text-purple-700' },
                    { label: 'งานรอดำเนินการ (รวม)', value: Number(stats.totalPendingTasks ?? stats.totalIssues ?? 0) || 0, icon: AlertCircle, color: 'bg-amber-50 text-amber-600', numColor: 'text-amber-800' },
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
                    <h2 className="font-bold text-gray-900">โครงการทั้งหมด ({projects.length})</h2>
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
                                <th className="px-5 py-3 text-left">ผู้เข้าร่วม</th>
                                <th className="px-5 py-3 text-center">งาน</th>
                                <th className="px-5 py-3 text-left">ความคืบหน้า</th>
                                <th className="px-5 py-3 text-center">งานค้าง</th>
                                <th className="px-5 py-3 text-left">กำหนด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-10 text-center text-gray-500 text-sm leading-relaxed">
                                        ไม่มีโครงการที่ผูกกับบัญชีพนักงานของคุณในระบบ
                                        <span className="block text-xs text-gray-400 mt-2">
                                            ให้ผู้ดูแลฐานข้อมูลเพิ่มแถวใน mapping_event_employees (employee_id ↔ event_id)
                                        </span>
                                    </td>
                                </tr>
                            ) : projects.map(proj => {
                                const cap = Math.max(Number(proj.maxParticipants) || 0, 1);
                                const fillPct = Math.min((Number(proj.participants) || 0) / cap * 100, 100);
                                return (
                                <tr key={proj.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <Link to={`/employee/activities/${proj.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                            {proj.title}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${proj.statusColor}`}>{proj.status}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                                <span>{proj.participants}/{proj.maxParticipants}</span>
                                                <span>{Math.round(fillPct)}%</span>
                                            </div>
                                            <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${fillPct}%` }} />
                                            </div>
                                        </div>
                                    </td>
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
                                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                                <AlertCircle size={10} /> {proj.issues} งานค้าง
                                            </span>
                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-400" /> {proj.deadline}
                                    </td>
                                </tr>
                                );
                            })}
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
                    {urgentTasks.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-6">ไม่มีงานเร่งด่วน</p>
                    ) : urgentTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                            <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
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
