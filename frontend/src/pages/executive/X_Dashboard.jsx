// pages/executive/X_Dashboard.jsx
// Executive dashboard with inline SVG charts (no library dependency)
import React, { useState } from 'react';
import { TrendingUp, Users, Activity, Star, ChevronRight, AlertCircle } from 'lucide-react';

const PROJECTS = [
    { name: 'Startup Thailand', status: 'กำลังดำเนินการ', progress: 65, teams: 12, budget: 150000, budgetUsed: 98000, feedback: 4.2 },
    { name: 'ELP Batch 5', status: 'เปิดรับสมัคร', progress: 20, teams: 6, budget: 80000, budgetUsed: 16000, feedback: 4.5 },
    { name: 'Innovation Challenge', status: 'เสร็จสิ้น', progress: 100, teams: 8, budget: 120000, budgetUsed: 115000, feedback: 4.8 },
    { name: 'NU Hackathon 48hrs', status: 'วางแผน', progress: 5, teams: 0, budget: 60000, budgetUsed: 3000, feedback: 0 },
    { name: 'Pitching Bootcamp', status: 'วางแผน', progress: 10, teams: 0, budget: 40000, budgetUsed: 4000, feedback: 0 },
    { name: 'NU Startup Demo Day', status: 'เปิดรับสมัคร', progress: 35, teams: 3, budget: 90000, budgetUsed: 31500, feedback: 0 },
];

// Monthly progress trend for bar chart (mock)
const MONTHLY_DATA = [
    { month: 'ต.ค.', projects: 2, teams: 8 },
    { month: 'พ.ย.', projects: 3, teams: 14 },
    { month: 'ธ.ค.', projects: 3, teams: 16 },
    { month: 'ม.ค.', projects: 5, teams: 22 },
    { month: 'ก.พ.', projects: 6, teams: 29 },
    { month: 'มี.ค.', projects: 6, teams: 21 },
];

function BarChart({ data }) {
    const max = Math.max(...data.map(d => d.teams));
    return (
        <div className="flex items-end gap-3 h-32 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 font-medium">{d.teams}</span>
                    <div className="w-full rounded-t-lg bg-blue-500/20 relative overflow-hidden" style={{ height: `${(d.teams / max) * 100}px` }}>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg" style={{ height: `${(d.projects / d.teams) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-400">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

function DonutChart({ value, max, color }) {
    const pct = value / max;
    const r = 30;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
            <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" />
            <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">
                {Math.round(pct * 100)}%
            </text>
        </svg>
    );
}

export default function X_Dashboard() {
    const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
    const usedBudget = PROJECTS.reduce((s, p) => s + p.budgetUsed, 0);
    const avgFeedback = (PROJECTS.filter(p => p.feedback > 0).reduce((s, p) => s + p.feedback, 0) / PROJECTS.filter(p => p.feedback > 0).length).toFixed(1);
    const totalTeams = PROJECTS.reduce((s, p) => s + p.teams, 0);

    const STATUS_COLOR = {
        'กำลังดำเนินการ': 'bg-emerald-100 text-emerald-700',
        'เปิดรับสมัคร': 'bg-blue-100 text-blue-700',
        'เสร็จสิ้น': 'bg-gray-100 text-gray-600',
        'ดำเนินการสำเร็จ': 'bg-gray-100 text-gray-600',
        'วางแผน': 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">ภาพรวมการดำเนินงาน NU SEED — ปีการศึกษา 2569</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'โครงการทั้งหมด', value: PROJECTS.length, sub: 'โครงการ', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'ทีมรวม', value: totalTeams, sub: 'ทีม', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'งบฯ ที่ใช้', value: `${Math.round(usedBudget / 1000)}K`, sub: `จาก ${Math.round(totalBudget / 1000)}K บาท`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Feedback เฉลี่ย', value: avgFeedback, sub: '/ 5.0 ดาว', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-sm font-semibold text-gray-700 mt-0.5">{kpi.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-bold text-gray-900 mb-1">แนวโน้มจำนวนทีมรายเดือน</h2>
                    <p className="text-xs text-gray-400 mb-4">แสดงจำนวนทีมที่เข้าร่วมในแต่ละเดือน</p>
                    <BarChart data={MONTHLY_DATA} />
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> จำนวนทีมรวม</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500/20 rounded-sm" /> เป้าหมาย</div>
                    </div>
                </div>

                {/* Budget donut */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-bold text-gray-900 mb-4">สัดส่วนงบประมาณ</h2>
                    <div className="flex flex-col items-center gap-4">
                        <DonutChart value={usedBudget} max={totalBudget} color="#3b82f6" />
                        <div className="w-full space-y-3">
                            {PROJECTS.filter(p => p.budgetUsed > 0).map((p, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span className="truncate font-medium">{p.name}</span>
                                        <span className="text-gray-400 shrink-0 ml-2">{Math.round((p.budgetUsed / totalBudget) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(p.budgetUsed / totalBudget) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Project status overview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-bold text-gray-900">สถานะโครงการทั้งหมด</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECTS.map((proj, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <p className="font-bold text-sm text-gray-900 truncate">{proj.name}</p>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${STATUS_COLOR[proj.status]}`}>{proj.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-gray-400' : 'bg-blue-500'}`} style={{ width: `${proj.progress}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 shrink-0">{proj.progress}%</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-lg font-bold text-gray-900">{proj.teams}</div>
                                <div className="text-[10px] text-gray-400">ทีม</div>
                            </div>
                            {proj.feedback > 0 && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <Star size={14} fill="#f59e0b" className="text-amber-400" />
                                    <span className="text-sm font-bold text-gray-700">{proj.feedback}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
