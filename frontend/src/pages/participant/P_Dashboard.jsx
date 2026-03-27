import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Bell, Trophy, Users, FileText, Star, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NOTIFICATIONS = [
    { id: 1, text: 'สถานะโครงการ "Startup Thailand League" เปลี่ยนเป็น กำลังดำเนินการ', time: '2 ชั่วโมงที่แล้ว', type: 'status', read: false },
    { id: 2, text: 'เอกสาร "Pitch Deck v2" ได้รับการอนุมัติแล้ว', time: '1 วันที่แล้ว', type: 'doc', read: false },
    { id: 3, text: 'กำหนดส่ง "Business Model Canvas" อีก 3 วัน', time: '2 วันที่แล้ว', type: 'deadline', read: true },
];

export default function P_Dashboard() {
    const { teamRole } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/dashboard-data/participant-data');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                console.error('Error fetching participant dashboard:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalProjects = projects.length;
    const inProgressCount = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
    const planCount = projects.filter(p => p.status === 'วางแผน').length;

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">สวัสดี ปิยะ 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {loading
                            ? 'กำลังโหลดข้อมูล...'
                            : totalProjects > 0
                                ? `คุณเข้าร่วม ${totalProjects} โครงการ — ${inProgressCount} โครงการกำลังดำเนินการ`
                                : 'ยังไม่มีโครงการที่คุณเข้าร่วมในขณะนี้'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
                    {teamRole === 'leader' ? '🏆 หัวหน้าทีม' : '👤 สมาชิกทีม'}
                </div>
            </div>

            {/* Notification bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Bell size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">มีการแจ้งเตือนใหม่ {NOTIFICATIONS.filter(n => !n.read).length} รายการ</p>
                    <p className="text-xs text-amber-600 mt-0.5">{NOTIFICATIONS[0].text}</p>
                </div>
                <Link to="/participant/notifications" className="text-xs text-amber-700 font-bold hover:underline shrink-0">ดูทั้งหมด →</Link>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                <div className="flex items-end justify-between">
                    <h2 className="text-lg font-bold text-gray-900">แดชบอร์ด</h2>
                    <Link to="/participant/projects" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                        ดูโครงการของฉัน →
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Loader2 className="animate-spin text-emerald-500" size={28} />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-2" size={28} />
                        <p className="text-red-700 font-semibold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs text-gray-400 mb-1">โครงการทั้งหมด</p>
                            <div className="flex items-center gap-3">
                                <Trophy size={20} className="text-amber-500" />
                                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs text-gray-400 mb-1">กำลังดำเนินการ</p>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <p className="text-xs text-gray-400 mb-1">รอเริ่ม</p>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                                <p className="text-2xl font-bold text-gray-900">{planCount}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'เอกสารของฉัน', icon: FileText, path: '/participant/documents', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'ทีมของฉัน', icon: Users, path: '/participant/team', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                    { label: 'ปฏิทินกิจกรรม', icon: CheckCircle2, path: '/participant/calendar', color: 'bg-green-50 text-green-600 border-green-100' },
                    { label: 'ส่ง Feedback', icon: Star, path: '/participant/feedback', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${item.color} hover:shadow-md transition-all text-center`}
                        >
                            <Icon size={22} />
                            <span className="text-xs font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
