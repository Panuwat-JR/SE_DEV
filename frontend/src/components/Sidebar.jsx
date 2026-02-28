import React from 'react';
// 1. เพิ่ม LogOut เข้ามา
import { 
  LayoutDashboard, Calendar, CalendarDays, Briefcase, 
  UsersRound, UserCircle, Users, FileCheck, Settings, LogOut 
} from 'lucide-react';
// 2. เพิ่ม useNavigate สำหรับทำปุ่มออกจากระบบ
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // 3. ดึงค่าสิทธิ์ที่เซฟไว้ตอน Login (ถ้าไม่มีให้ถือว่าเป็น participant)
  const userRole = localStorage.getItem('userRole') || 'participant';

  // ฟังก์ชันช่วยเช็คว่าตอนนี้อยู่หน้าไหน
  const isActive = (path) => location.pathname === path;

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('userRole'); // ล้างสิทธิ์ทิ้ง
    navigate('/login'); // เด้งไปหน้า Login
  };

  // 4. สร้างตัวแปรเก็บเมนูทั้งหมด พร้อมระบุสิทธิ์ (roles)
  const menuItems = [
    { name: 'แดชบอร์ด', icon: <LayoutDashboard size={20} />, path: '/', roles: ['admin', 'pm', 'participant'] },
    { name: 'ปฏิทิน', icon: <Calendar size={20} />, path: '/calendar', roles: ['admin', 'pm', 'participant'] },
    { name: 'กิจกรรม', icon: <CalendarDays size={20} />, path: '/activities', roles: ['admin', 'pm', 'participant'] },
    { name: 'งาน', icon: <Briefcase size={20} />, path: '/tasks', roles: ['admin', 'pm'] }, // ผู้เข้าร่วมไม่เห็น
    { name: 'ทีม', icon: <UsersRound size={20} />, path: '/teams', roles: ['admin', 'pm', 'participant'] },
    { name: 'ผู้เข้าร่วม', icon: <UserCircle size={20} />, path: '/participants', roles: ['admin', 'pm'] }, // ผู้เข้าร่วมไม่เห็น
    { name: 'พนักงาน', icon: <Users size={20} />, path: '/employees', roles: ['admin', 'pm', 'participant'] },
    { name: 'เอกสาร', icon: <FileCheck size={20} />, path: '/documents', roles: ['admin', 'pm'] }, // ผู้เข้าร่วมไม่เห็น
  ];

  // 5. กรองเอาเฉพาะเมนูที่ตรงกับสิทธิ์ของผู้ใช้คนปัจจุบัน
  const allowedMenus = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-[#0f172a] text-gray-300 flex flex-col shrink-0 relative z-20 shadow-xl">
      <div className="h-16 flex items-center px-6 gap-3 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">NU</div>
        <div>
          <div className="font-bold text-lg leading-tight">NU SEED</div>
          <div className="text-[10px] text-gray-400">ระบบติดตามโครงการ</div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col space-y-1 overflow-y-auto text-sm font-medium">
        
        {/* 6. เอาเมนูที่กรองแล้วมาวนลูปสร้าง <Link> */}
        {allowedMenus.map((item, index) => (
          <Link 
            key={index}
            to={item.path} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:text-white hover:bg-gray-800/50'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}

        {/* เส้นแบ่ง */}
        <div className="my-4 border-t border-gray-800"></div>

        {/* เมนูตั้งค่า (ทุกคนเห็น เลยแยกออกมาด้านล่าง) */}
        <Link 
          to="/settings" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive('/settings') 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Settings size={20} /> 
          <span>ตั้งค่า</span>
        </Link>
      </nav>

      {/* 7. ปุ่มออกจากระบบ (Logout) อยู่ล่างสุด */}
      <div className="p-4 mt-auto border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;