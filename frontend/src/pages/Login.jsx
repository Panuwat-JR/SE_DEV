import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, UserCog, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // State จำลองการเลือก Role ตาม Usecase Diagram
  const [selectedRole, setSelectedRole] = useState('pm');

  const roles = [
    { id: 'admin', name: 'ผู้บริหาร', icon: <ShieldCheck size={18} />, desc: 'ดูภาพรวมและรายงาน' },
    { id: 'pm', name: 'ผู้รับผิดชอบโครงการ', icon: <UserCog size={18} />, desc: 'จัดการและอัปเดตข้อมูล' },
    { id: 'participant', name: 'ผู้เข้าร่วมโครงการ', icon: <User size={18} />, desc: 'ติดตามและดูสถานะ' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 💡 จำลองการเก็บสิทธิ์ (Role) ลงใน LocalStorage ของเบราว์เซอร์
    // ในอนาคตเราจะเอาค่านี้ไปเช็คใน Sidebar ว่าจะให้เห็นเมนูไหนบ้าง
    localStorage.setItem('userRole', selectedRole);
    
    // เข้าสู่ระบบสำเร็จ ให้เด้งไปหน้า Dashboard
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ฝั่งซ้าย: โลโก้และข้อความต้อนรับ (แบรนด์ดิ้ง) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/30">
              NU
            </div>
            <span className="text-2xl font-bold tracking-tight">NU SEED</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            ระบบติดตามโครงการ<br/>
            <span className="text-blue-400">สำหรับมหาวิทยาลัย</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            แพลตฟอร์มศูนย์กลางในการบริหารจัดการกิจกรรม ติดตามสถานะงาน และรวบรวมข้อมูลผู้เข้าร่วมโครงการอย่างมีประสิทธิภาพ
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-gray-500">
          © 2026 Naresuan University. All rights reserved.
        </div>
      </div>

      {/* ฝั่งขวา: ฟอร์ม Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
            <p className="text-gray-500">กรุณากรอกอีเมลและรหัสผ่านของคุณ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Input อีเมล */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="admin@nu.ac.th"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Input รหัสผ่าน */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 block">รหัสผ่าน</label>
                <a href="#" className="text-sm text-blue-600 hover:underline font-medium">ลืมรหัสผ่าน?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* 💡 ส่วนจำลองการเลือกสิทธิ์การเข้าใช้งาน (Role Selector) */}
            <div className="pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700 block mb-3">
                เข้าใช้งานในฐานะ (สำหรับการทดสอบ)
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((r) => (
                  <label 
                    key={r.id} 
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedRole === r.id 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="role" 
                      value={r.id}
                      checked={selectedRole === r.id}
                      onChange={() => setSelectedRole(r.id)}
                      className="hidden"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${
                      selectedRole === r.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.icon}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${selectedRole === r.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all mt-6"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;