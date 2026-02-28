import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

function Header() {
  // 1. ดึงสิทธิ์ที่เซฟไว้ตอน Login มาเช็ค (ถ้าไม่มีให้ถือว่าเป็น participant)
  const userRole = localStorage.getItem('userRole') || 'participant';

  // 2. กำหนดข้อมูลโปรไฟล์ที่จะแสดงตาม Role ที่ล็อกอินเข้ามา
  const getUserInfo = () => {
    switch (userRole) {
      case 'admin':
        return { name: 'ดร. สมปอง รักดี', title: 'ผู้บริหาร' };
      case 'pm':
        return { name: 'สมชาย สมศรี', title: 'เจ้าหน้าที่บริหาร' }; // ตรงตามภาพต้นฉบับของคุณ
      case 'participant':
        return { name: 'นิสิต อนุชา', title: 'ผู้เข้าร่วมโครงการ' };
      default:
        return { name: 'ผู้ใช้งานทั่วไป', title: 'ไม่ระบุตำแหน่ง' };
    }
  };

  // เรียกใช้ฟังก์ชันเพื่อเก็บค่าไว้ในตัวแปร userInfo
  const userInfo = getUserInfo();

  return (
    <header className="h-16 bg-white flex items-center justify-between px-8 border-b border-gray-100 z-10 shrink-0">
      
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="ค้นหาโครงการ, ผู้เข้าร่วม..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
          <div className="text-right">
            {/* 3. นำตัวแปร userInfo มาแสดงผลแทนข้อความที่พิมพ์ตายตัว */}
            <div className="text-sm font-semibold text-gray-700">{userInfo.name}</div>
            <div className="text-xs text-gray-500">{userInfo.title}</div>
          </div>
          
          <div className="w-9 h-9 bg-gray-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <UserCircle className="text-gray-400 w-full h-full" />
          </div>
        </div>
        
      </div>
    </header>
  );
}

export default Header;