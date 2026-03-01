// layouts/EmployeeLayout.jsx
// Sidebar navy (เหมือน design เดิม) สำหรับ Employee
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, CalendarDays, Briefcase,
    UsersRound, UserCircle, FileCheck, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MENUS = [
    { name: 'แดชบอร์ด', icon: LayoutDashboard, path: '/employee/dashboard' },
    { name: 'กิจกรรม/โครงการ', icon: CalendarDays, path: '/employee/activities' },
    { name: 'งาน (Tasks)', icon: Briefcase, path: '/employee/tasks' },
    { name: 'ทีมและสมาชิก', icon: UsersRound, path: '/employee/teams' },
    { name: 'ผู้เข้าร่วม', icon: UserCircle, path: '/employee/participants' },
    { name: 'เอกสาร', icon: FileCheck, path: '/employee/documents' },
    { name: 'ปฏิทิน', icon: Calendar, path: '/employee/calendar' },
];

export default function EmployeeLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f172a] text-gray-300 flex flex-col shrink-0 shadow-xl">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 gap-3 text-white border-b border-gray-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow">NU</div>
                    <div>
                        <div className="font-bold text-base leading-tight">NU SEED</div>
                        <div className="text-[10px] text-gray-400">พนักงาน NU SEED</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-sm font-medium">
                    {MENUS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'hover:text-white hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">ส</div>
                        <div>
                            <div className="text-white text-sm font-bold">สมชาย สมศรี</div>
                            <div className="text-[10px] text-gray-400">ผู้จัดการโครงการ</div>
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
                            {MENUS.find(m => isActive(m.path))?.name || 'Employee'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                            👔 พนักงาน NU SEED
                        </div>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">ส</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
