// pages/participant/P_Team.jsx
import React, { useEffect, useState } from 'react';
import { Users, Crown, Mail, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { participantFetch } from '../../lib/participantApi';

function pickColor(idx) {
    const colors = [
        'bg-emerald-600',
        'bg-blue-500',
        'bg-purple-500',
        'bg-indigo-500',
        'bg-amber-500',
        'bg-sky-500',
        'bg-gray-500',
    ];
    return colors[idx % colors.length];
}

export default function P_Team() {
    const { teamRole } = useAuth();
    const isLeader = teamRole === 'leader';
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await participantFetch('/api/participants-data/team');
                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody.error || `โหลดข้อมูลทีมไม่สำเร็จ (${res.status})`);
                }
                const data = await res.json();
                setTeam(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-emerald-500 mb-2" size={36} />
                <p className="text-gray-500 text-sm">กำลังโหลดข้อมูลทีม...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-slate-50/90 p-8 flex gap-3 text-slate-700 shadow-sm">
                <AlertCircle className="shrink-0 text-slate-500" size={22} aria-hidden />
                <span>{error}</span>
            </div>
        );
    }

    if (!team || !team.members?.length) {
        return (
            <div className="max-w-3xl mx-auto bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-600">
                ยังไม่พบทีมในระบบ — ตรวจสอบว่า participant profile ผูก team_id และ mapping อีเวนต์แล้ว
            </div>
        );
    }

    const members = team.members.map((m, idx) => ({
        ...m,
        color: m.color || pickColor(idx),
        initial: m.initial || String(m.name || '?').trim().charAt(0) || '?',
        email: m.email || '—',
    }));

    const leaderCount = team.leaderCount ?? members.filter((m) => m.isLeader).length;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ทีม {team.name || '—'}</h1>
                    <p className="text-gray-500 text-sm mt-1">{team.project || '—'}</p>
                </div>
            </div>

            {!isLeader && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                    <Shield size={16} />{' '}
                    <span>
                        คุณเป็น <strong>สมาชิกทีม</strong> ตามข้อมูลในระบบ — ดูรายชื่อและรายละเอียดทีมได้อย่างเดียว
                    </span>
                </div>
            )}

            {isLeader && (
                <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    คุณเป็นหัวหน้าทีมตามลำดับในฐานข้อมูล — การเพิ่ม/ถอนสมาชิกให้ดำเนินการผ่านผู้จัดงาน
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{members.length}</div>
                    <div className="text-xs text-gray-500 mt-1">สมาชิกทั้งหมด</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{leaderCount}</div>
                    <div className="text-xs text-gray-500 mt-1">หัวหน้าทีม</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-gray-700">{team.maxMembers ?? '—'}</div>
                    <div className="text-xs text-gray-500 mt-1">รับได้สูงสุด</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <Users size={18} className="text-emerald-600" /> สมาชิก
                </h2>
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                member.isLeader
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-gray-50 border-gray-100'
                            }`}
                        >
                            <div
                                className={`w-11 h-11 ${member.color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
                            >
                                {member.initial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                                    {member.isLeader && (
                                        <span className="flex items-center gap-1 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                            <Crown size={9} /> หัวหน้า
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {member.faculty} · ปีที่ {member.year}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Mail size={10} /> {member.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
