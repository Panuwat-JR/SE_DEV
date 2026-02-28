import React from 'react';
import { LayoutDashboard, CalendarDays, Briefcase, UsersRound, UserCircle, Users, FileCheck, Settings } from 'lucide-react';
// นำเข้า Link และ useLocation จาก react-router-dom เพื่อทำเมนูเปลี่ยนหน้าแบบไม่โหลดใหม่
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  // ฟังก์ชันช่วยเช็คว่าตอนนี้อยู่หน้าไหน เพื่อเปลี่ยนสีปุ่มให้สว่างขึ้นอัตโนมัติ
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#0f172a] text-gray-300 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 gap-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">NU</div>
        <div>
          <div className="font-bold text-lg leading-tight">NU SEED</div>
          <div className="text-[10px] text-gray-400">ระบบติดตามโครงการ</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-sm font-medium">
        {/* เปลี่ยนจาก <a> เป็น <Link> เพื่อให้เปลี่ยนหน้าได้ไวปรื๊ด */}
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <LayoutDashboard size={20} /><span>แดชบอร์ด</span>
        </Link>
        <Link to="/activities" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/activities') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <CalendarDays size={20} /> <span>กิจกรรม</span>
        </Link>

        {/* เมนูอื่นๆ ปล่อยเป็น a ไว้ก่อน เดี๋ยวเราค่อยมาแก้ตอนสร้างหน้าเสร็จครับ */}
        <Link to="/tasks" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/tasks') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <Briefcase size={20} /> <span>งาน</span>
        </Link>
        <Link to="/teams" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/teams') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <UsersRound size={20} /> <span>ทีม</span>
        </Link>
        {/* แก้จุดนี้: เปลี่ยนจาก <a> เป็น <Link> เพื่อลิงก์ไปหน้าผู้เข้าร่วม */}
        <Link to="/participants" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/participants') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <UserCircle size={20} /> <span>ผู้เข้าร่วม</span>
        </Link>
        <Link to="/employees" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/employees') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <Users size={20} /> <span>พนักงาน</span>
        </Link>
        <Link to="/documents" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/documents') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <FileCheck size={20} /> <span>เอกสาร</span>
        </Link>
        <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-8 ${isActive('/settings') ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}>
          <Settings size={20} /> <span>ตั้งค่า</span>
        </Link>
      </nav>
    </aside>
  );
}

export default Sidebar;