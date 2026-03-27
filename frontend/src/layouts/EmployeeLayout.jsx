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
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-sm">NU</div>
                    <div>
                        <div className="font-bold text-gray-900 text-base leading-tight">NU SEED</div>
                        <div className="text-[10px] text-gray-500 font-medium">พนักงาน NU SEED</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto text-sm font-medium">
                    {MENUS.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link key={item.path} to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-50/80 text-blue-700 font-bold'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon size={18} className={active ? "text-blue-600" : "text-gray-400"} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm border border-gray-200">ส</div>
                        <div>
                            <div className="text-gray-900 text-sm font-bold">สมชาย สมศรี</div>
                            <div className="text-[10px] text-gray-500">ผู้จัดการโครงการ</div>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm">
                        <LogOut size={18} /><span>ออกจากระบบ</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Workspace</span>
                        <ChevronRight size={14} className="text-gray-300" />
                        <span className="text-gray-800 font-bold text-sm">
                            {MENUS.find(m => isActive(m.path))?.name || 'Employee'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            พนักงาน NU SEED
                        </div>
                        <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm">ส</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
