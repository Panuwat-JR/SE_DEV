// pages/participant/P_ProjectDetail.jsx
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Trophy, Users, Clock, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

const PROJECTS = {
    1: {
        id: 1, title: 'Startup Thailand League 2026', status: 'กำลังดำเนินการ',
        statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        prize: '50,000 บาท', team: 'GreenBridge', maxParticipants: 5, currentParticipants: 4,
        description: 'โครงการ Startup Thailand League คือเวทีการแข่งขัน Startup ระดับประเทศ ที่เปิดโอกาสให้นักศึกษาได้พัฒนาไอเดียธุรกิจสู่ Startup จริง พร้อมรับทุนสนับสนุนและโอกาสต่อยอด',
        timeline: [
            { phase: 'เปิดรับสมัคร', start: '1 ก.พ. 2569', end: '28 ก.พ. 2569', done: true },
            { phase: 'ส่ง Business Plan', start: '1 มี.ค. 2569', end: '15 มี.ค. 2569', done: false, current: true },
            { phase: 'รอบ Pitching', start: '20 มี.ค. 2569', end: '22 มี.ค. 2569', done: false },
            { phase: 'ประกาศผล', start: '30 มี.ค. 2569', end: '30 มี.ค. 2569', done: false },
        ],
        tasks: [
            { id: 1, name: 'ลงทะเบียนสมัครทีม', done: true },
            { id: 2, name: 'จัดทำ Business Model Canvas', done: true },
            { id: 3, name: 'ส่ง Pitch Deck รอบแรก', done: true },
            { id: 4, name: 'แก้ไข Pitch Deck ตามคำแนะนำ', done: true },
            { id: 5, name: 'ส่ง Business Plan ฉบับสมบูรณ์', done: false },
            { id: 6, name: 'ซ้อม Pitching', done: false },
            { id: 7, name: 'เข้าร่วม Pitching Day', done: false },
            { id: 8, name: 'รับฟังผลการตัดสิน', done: false },
        ],
    },
    2: {
        id: 2, title: 'ELP Batch 5 — Naresuan', status: 'เปิดรับสมัคร',
        statusColor: 'bg-blue-100 text-blue-700 border-blue-200',
        prize: '10,000 บาท', team: 'EcoFlow', maxParticipants: 10, currentParticipants: 6,
        description: 'Experiential Learning Program (ELP) โครงการเรียนรู้เชิงประสบการณ์ที่เปิดโอกาสให้นิสิตได้พัฒนาทักษะการเป็นผู้ประกอบการผ่านการลงมือทำจริง',
        timeline: [
            { phase: 'เปิดรับสมัคร', start: '1 มี.ค. 2569', end: '30 มี.ค. 2569', done: false, current: true },
            { phase: 'Orientation', start: '5 เม.ย. 2569', end: '5 เม.ย. 2569', done: false },
            { phase: 'Workshop Series', start: '10 เม.ย. 2569', end: '30 เม.ย. 2569', done: false },
            { phase: 'Demo Day', start: '15 พ.ค. 2569', end: '15 พ.ค. 2569', done: false },
        ],
        tasks: [
            { id: 1, name: 'ยืนยันการสมัครเข้าร่วม', done: false },
            { id: 2, name: 'กรอกแบบสอบถามความสนใจ', done: false },
            { id: 3, name: 'อัปโหลดเอกสารประกอบ', done: false },
            { id: 4, name: 'รับการยืนยันจากผู้รับผิดชอบ', done: false },
            { id: 5, name: 'เข้าร่วม Orientation', done: false },
        ],
    },
};

export default function P_ProjectDetail() {
    const { id } = useParams();
    const project = PROJECTS[id] || PROJECTS[1];
    const done = project.tasks.filter(t => t.done).length;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/participant/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-medium mb-4">
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
                        <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Calendar size={18} className="text-emerald-600" /> ปฏิทินกำหนดการ</h3>
                        <div className="space-y-3">
                            {project.timeline.map((phase, idx) => (
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
                            <h3 className="font-bold text-gray-900">รายการงาน ({done}/{project.tasks.length})</h3>
                            <div className="text-sm font-bold text-emerald-600">{Math.round((done / project.tasks.length) * 100)}%</div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(done / project.tasks.length) * 100}%` }} />
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
                                <p className="text-xs text-amber-600 font-bold">เงินรางวัล</p>
                                <p className="font-bold text-amber-800">{project.prize}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">ผู้เข้าร่วม</p>
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
                            <p className="text-2xl font-bold text-blue-600">4</p>
                            <p className="text-xs text-gray-500 mt-1">เอกสาร</p>
                        </Link>
                        <Link to="/participant/team" className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:shadow-md hover:border-emerald-200 transition-all">
                            <p className="text-2xl font-bold text-emerald-600">4</p>
                            <p className="text-xs text-gray-500 mt-1">สมาชิก</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
