// pages/participant/P_Team.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, Crown, Mail, Phone, Plus, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function pickColor(idx) {
    const colors = ['bg-emerald-600', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-sky-500', 'bg-gray-500'];
    return colors[idx % colors.length];
}

export default function P_Team() {
    const { teamRole } = useAuth();
    const isLeader = teamRole === 'leader';
    const [team, setTeam] = useState({ name: '', project: '', members: [] });
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', email: '', faculty: '', year: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const hydratedMembers = useMemo(() => {
        return (team.members || []).map((m, idx) => {
            const initial = (m.name || '').trim().charAt(0) || '?';
            const isLeaderMember = String(m.name || '').includes('ปิยะ'); // demo
            return {
                ...m,
                initial,
                color: m.color || pickColor(idx),
                isLeader: Boolean(m.isLeader) || isLeaderMember,
                email: m.email || '-',
                phone: m.phone || '-'
            };
        });
    }, [team.members]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('http://localhost:5000/api/participants-data/team');
                if (!res.ok) throw new Error(`Failed to fetch team (HTTP ${res.status})`);
                const data = await res.json();
                setTeam({
                    name: data.name || '',
                    project: data.project || '',
                    members: data.members || []
                });
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAddMember = (e) => {
        e.preventDefault();
        (async () => {
            try {
                const res = await fetch('http://localhost:5000/api/participants-data/team/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newMember.name,
                        email: newMember.email,
                        faculty: newMember.faculty,
                        year: Number(newMember.year)
                    })
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err?.error || `Add member failed (HTTP ${res.status})`);
                }
                const created = await res.json();
                const memberName = `${created.firstname}${created.lastname ? ` ${created.lastname}` : ''}`.trim();
                setTeam(prev => ({
                    ...prev,
                    members: [...(prev.members || []), {
                        id: created.id,
                        name: memberName,
                        faculty: newMember.faculty,
                        year: created.year ?? Number(newMember.year) ?? null,
                        email: created.email || newMember.email || '-',
                        phone: '-'
                    }]
                }));
                setIsAddOpen(false);
                setNewMember({ name: '', email: '', faculty: '', year: 1 });
            } catch (e2) {
                alert(e2.message);
            }
        })();
    };

    const handleRemove = (id) => {
        if (!window.confirm('ลบสมาชิกออกจากทีม?')) return;
        (async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/participants-data/team/members/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err?.error || `Remove member failed (HTTP ${res.status})`);
                }
                setTeam(prev => ({ ...prev, members: (prev.members || []).filter(m => m.id !== id) }));
            } catch (e) {
                alert(e.message);
            }
        })();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ทีม {team.name || '—'}</h1>
                    <p className="text-gray-500 text-sm mt-1">{team.project || '—'}</p>
                </div>
                {isLeader && (
                    <button onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">
                        <Plus size={18} /> เพิ่มสมาชิก
                    </button>
                )}
            </div>

            {/* Role indicator */}
            {!isLeader && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                    <Shield size={16} /> <span>คุณเป็น <strong>สมาชิก</strong> ของทีมนี้ — ดูข้อมูลได้อย่างเดียว (สลับเป็นหัวหน้าได้จาก toggle ใน sidebar)</span>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">{hydratedMembers.length}</div>
                    <div className="text-xs text-gray-500 mt-1">สมาชิกทั้งหมด</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{hydratedMembers.filter(m => m.isLeader).length || 1}</div>
                    <div className="text-xs text-gray-500 mt-1">หัวหน้าทีม</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <div className="text-3xl font-bold text-gray-700">5</div>
                    <div className="text-xs text-gray-500 mt-1">รับได้สูงสุด</div>
                </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Users size={18} className="text-emerald-600" /> สมาชิก</h2>
                {loading ? (
                    <div className="py-10 text-center text-sm text-gray-400">กำลังโหลดข้อมูลทีม...</div>
                ) : error ? (
                    <div className="py-10 text-center text-sm text-red-500">{error}</div>
                ) : (
                    <div className="space-y-3">
                    {hydratedMembers.map(member => (
                        <div key={member.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${member.isLeader ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'
                            }`}>
                            <div className={`w-11 h-11 ${member.color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
                                {member.initial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{member.name}</span>
                                    {member.isLeader && (
                                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                                            <Crown size={9} /> หัวหน้า
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">{member.faculty} · ปีที่ {member.year}</div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Mail size={10} /> {member.email}</span>
                                </div>
                            </div>
                            {isLeader && !member.isLeader && (
                                <button onClick={() => handleRemove(member.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* Add Member Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[440px] shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold">เพิ่มสมาชิก</h2>
                            <button onClick={() => setIsAddOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
                                <input required type="email" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">คณะ</label>
                                    <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={newMember.faculty} onChange={(e) => setNewMember({ ...newMember, faculty: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชั้นปี</label>
                                    <input type="number" min="1" max="6" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={newMember.year} onChange={(e) => setNewMember({ ...newMember, year: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700">เพิ่มสมาชิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
