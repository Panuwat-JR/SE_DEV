// layouts/ParticipantLayout.jsx
// Sidebar พอร์ทัลผู้เข้าร่วม — บทบาทหัวหน้าทีมมาจากฐานข้อมูล (สมาชิกแรกที่มีบัญชีในทีม)
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, FileText, Users,
    Bell, MessageCircle, Star, LogOut, ChevronRight, Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParticipantPortalProvider } from '../context/ParticipantPortalContext';
import { getParticipantFirstname } from '../lib/participantApi';
import ErrorBoundary from '../components/ErrorBoundary';

const MENUS = [
    { name: 'แดชบอร์ด', icon: LayoutDashboard, path: '/participant/dashboard' },
    // แยกหน้ารายการ “โครงการของฉัน” ออกจากหน้าแดชบอร์ด เพื่อไม่ให้ดูเหมือนรวมกัน
    { name: 'โครงการของฉัน', icon: ChevronRight, path: '/participant/projects' },
    { name: 'เอกสาร', icon: FileText, path: '/participant/documents' },
    { name: 'ทีม', icon: Users, path: '/participant/team' },
    { name: 'การแจ้งเตือน', icon: Bell, path: '/participant/notifications' },
    { name: 'ติดต่อผู้รับผิดชอบ', icon: MessageCircle, path: '/participant/contact' },
    { name: 'ปฏิทินกิจกรรม', icon: Calendar, path: '/participant/calendar' },
    { name: 'Feedback', icon: Star, path: '/participant/feedback' },
    { name: 'ตั้งค่า', icon: Settings, path: '/participant/settings' },
];

export default function ParticipantLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, teamRole, participantProfile, participantProfileLoading } = useAuth();

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-[#f0f8ff] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0c1e3c] text-gray-300 flex flex-col shrink-0 shadow-xl">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 gap-3 text-white border-b border-sky-900/50">
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-sm shadow">NU</div>
                    <div>
                        <div className="font-bold text-base leading-tight">NU SEED</div>
                        <div className="text-[10px] text-sky-400">ผู้เข้าร่วมโครงการ</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-sm font-medium">
                    {MENUS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                    : 'hover:text-white hover:bg-sky-900/40'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-sky-900/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {participantProfileLoading
                                ? '…'
                                : participantProfile?.initial || (getParticipantFirstname().charAt(0) || '?')}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white text-sm font-bold truncate">
                                {participantProfileLoading
                                    ? 'กำลังโหลดโปรไฟล์...'
                                    : participantProfile?.displayName || getParticipantFirstname()}
                            </div>
                            <div className="text-[10px] text-sky-400 truncate">
                                {participantProfile?.teamName
                                    ? `${participantProfile.teamName}${participantProfile.year != null ? ` · ปี ${participantProfile.year}` : ''}`
                                    : participantProfile
                                        ? 'ยังไม่ผูกทีมในระบบ'
                                        : `คีย์เชื่อมต่อ: ${getParticipantFirstname()}`}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium text-sm">
                        <LogOut size={18} /><span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Workspace</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-800 font-semibold text-sm">
                            {MENUS.find(m => isActive(m.path))?.name || 'ผู้เข้าร่วมโครงการ'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
                            {participantProfileLoading
                                ? '…'
                                : teamRole === 'leader'
                                    ? '🏆 หัวหน้าทีม'
                                    : '👤 สมาชิกทีม'}
                        </div>
                        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {participantProfile?.initial || getParticipantFirstname().charAt(0) || '?'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <ErrorBoundary>
                        <ParticipantPortalProvider>
                            <Outlet />
                        </ParticipantPortalProvider>
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
}
