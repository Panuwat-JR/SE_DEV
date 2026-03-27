import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, Bell, ChevronRight, Trophy, Users, FileText, Star, Loader2 } from 'lucide-react';
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

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">สวัสดี ปิยะ 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {loading ? 'กำลังโหลดข้อมูล...' : (
                            projects.length > 0 
                                ? `คุณเข้าร่วม ${projects.length} โครงการ — ${projects.filter(p => p.status === 'กำลังดำเนินการ').length} โครงการกำลังดำเนินการ`
                                : 'ยังไม่มีโครงการที่คุณเข้าร่วมในขณะนี้'
                        )}
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

            {/* Project Cards */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">โครงการที่เข้าร่วม</h2>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                        <p className="text-gray-400 text-sm">กำลังโหลดข้อมูลโครงการจากฐานข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-10 rounded-2xl text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                        <p className="text-red-700 font-semibold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 p-16 rounded-2xl text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">ไม่พบโครงการที่คุณเข้าร่วม</h3>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">ดูเหมือนว่าข้อมูลในฐานข้อมูลจะยังว่างอยู่ หรือคุณยังไม่ได้ถูกเพิ่มเข้าไปในโครงการใดๆ</p>
                        <Link to="/activities" className="inline-block mt-6 px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                            ค้นหากิจกรรมใหม่
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {projects.map((proj) => (
                            <Link to={`/participant/projects/${proj.id}`} key={proj.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all group p-5 block">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                        proj.status === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        proj.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        proj.status === 'ดำเนินการสำเร็จ' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                        proj.status === 'วางแผน' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}>{proj.status}</span>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{proj.title}</h3>
                                <p className="text-xs text-gray-400 mb-4">ทีม: {proj.team} · {proj.role}</p>

                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                        <span>ความคืบหน้า</span>
                                        <span className="font-bold">{proj.doneItems}/{proj.totalItems}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${proj.progressColor} h-full rounded-full`} style={{ width: `${proj.progress}%` }} />
                                    </div>
                                </div>

                                {proj.nextTask !== '—' && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                        <Clock size={12} className="text-amber-500 shrink-0" />
                                        <span className="truncate">{proj.nextTask}</span>
                                        <span className="text-[10px] text-gray-400 ml-auto shrink-0">{proj.nextDeadline}</span>
                                    </div>
                                )}
                                {proj.status === 'ดำเนินการสำเร็จ' && (
                                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                                        <CheckCircle2 size={12} /> <span>โครงการเสร็จสิ้นแล้ว 🎉</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                                    <Trophy size={12} className="text-amber-500" />
                                    <span className="text-xs text-gray-500">รางวัล {proj.prize}</span>
                                </div>
                            </Link>
                        ))}
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
                        <Link key={item.path} to={item.path}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${item.color} hover:shadow-md transition-all text-center`}>
                            <Icon size={22} />
                            <span className="text-xs font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
