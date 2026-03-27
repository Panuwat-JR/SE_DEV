// pages/participant/P_ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, Users, Clock, CheckCircle2, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';

export default function P_ProjectDetail() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjectDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/participants-data/projects/${id}`);
                if (!response.ok) {
                    // ดึงข้อความ error จากฝั่ง backend มาแสดง เพื่อช่วยชี้สาเหตุ (404/500 ฯลฯ)
                    const errData = await response.json().catch(() => null);
                    const message =
                        errData?.details ||
                        errData?.error ||
                        `Failed to fetch project details (HTTP ${response.status})`;
                    throw new Error(message);
                }
                const data = await response.json();
                setProject(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500 animate-pulse font-medium">กำลังโหลดรายละเอียดโครงการ...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-900 mb-2">เกิดข้อผิดพลาด</h2>
                <p className="text-red-600 mb-8">{error || 'ไม่พบข้อมูลโครงการ'}</p>
                <Link to="/participant/projects" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-md">
                    <ArrowLeft size={20} /> กลับไปหน้ารายการโครงการ
                </Link>
            </div>
        );
    }

    const doneCount = project.tasks.filter(t => t.done).length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/participant/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-medium mb-4">
                    <ArrowLeft size={16} /> กลับ
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${project.statusColor}`}>{project.status}</span>
                        </div>
                        <p className="text-gray-500 text-sm">ทีม: {project.team}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Description */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-3">รายละเอียดโครงการ</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{project.description || 'ไม่มีคำอธิบายโครงการ'}</p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Calendar size={18} className="text-emerald-600" /> ปฏิทินกำหนดการ</h3>
                        <div className="space-y-3">
                            {(project.timeline || []).map((phase, idx) => (
                                <div key={idx} className={`flex items-center gap-4 p-3.5 rounded-xl border ${phase.done ? 'bg-gray-50 border-gray-100' :
                                        phase.current ? 'bg-emerald-50 border-emerald-200' :
                                            'bg-white border-gray-100'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${phase.done ? 'bg-gray-300 text-white' :
                                            phase.current ? 'bg-emerald-500 text-white' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        {phase.done ? <CheckCircle2 size={16} /> : idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-bold ${phase.current ? 'text-emerald-800' : 'text-gray-700'}`}>{phase.phase}</p>
                                            {phase.current && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">ปัจจุบัน</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">{phase.start}{phase.start !== phase.end ? ` — ${phase.end}` : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">รายการงาน ({doneCount}/{totalTasks})</h3>
                            <div className="text-sm font-bold text-emerald-600">{progress}%</div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="space-y-2">
                            {project.tasks.map(task => (
                                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${task.done ? 'opacity-60' : ''}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                                        }`}>
                                        {task.done && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <Trophy size={20} className="text-amber-600" />
                            <div>
                                <p className="text-xs text-amber-600 font-bold">เงินรางวัลสูงถึง</p>
                                <p className="font-bold text-amber-800">{project.prize}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">สมาชิกในทีม</p>
                            <div className="flex justify-between text-sm font-bold text-gray-700">
                                <span>{project.currentParticipants}/{project.maxParticipants} คน</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(project.currentParticipants / project.maxParticipants) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/participant/documents" className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-emerald-200 transition-all">
                            <p className="text-2xl font-bold text-blue-600">0</p>
                            <p className="text-xs text-gray-500 mt-1">เอกสาร</p>
                        </Link>
                        <Link to="/participant/team" className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-emerald-200 transition-all">
                            <p className="text-2xl font-bold text-emerald-600">{project.currentParticipants}</p>
                            <p className="text-xs text-gray-500 mt-1">สมาชิก</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
