import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCog, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    id: 'participant',
    label: 'ผู้เข้าร่วมโครงการ',
    sublabel: 'ดูสถานะ, จัดการเอกสาร, ส่ง feedback',
    icon: User,
    accent: 'from-sky-400 to-sky-600',
    ring: 'ring-sky-500',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-300',
    redirect: '/participant/dashboard',
  },
  {
    id: 'employee',
    label: 'ผู้รับผิดชอบโครงการ',
    sublabel: 'จัดการโครงการ, งาน, ทีม, เอกสาร',
    icon: UserCog,
    accent: 'from-blue-600 to-indigo-600',
    ring: 'ring-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    redirect: '/employee/dashboard',
  },
  {
    id: 'executive',
    label: 'ผู้บริหาร (Executive)',
    sublabel: 'ภาพรวม KPI, กราฟแนวโน้ม, Feedback',
    icon: ShieldCheck,
    accent: 'from-blue-600 to-indigo-600',
    ring: 'ring-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    redirect: '/executive/dashboard',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('employee');

  const handleLogin = (e) => {
    e.preventDefault();
    const role = ROLES.find(r => r.id === selectedRole);
    login(selectedRole);
    navigate(role.redirect);
  };

  const selected = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-blue-600/30">
            NU
          </div>
          <div>
            <div className="text-white font-bold text-2xl tracking-tight">NU SEED</div>
            <div className="text-gray-400 text-xs">ระบบติดตามโครงการ</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-1">เข้าสู่ระบบ</h2>
          <p className="text-gray-400 text-sm mb-8">เลือกประเภทผู้ใช้งานของคุณ</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Cards */}
            <div className="space-y-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <label key={role.id} className="cursor-pointer block">
                    <input type="radio" name="role" value={role.id} checked={isSelected}
                      onChange={() => setSelectedRole(role.id)} className="sr-only" />
                    <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isSelected
                      ? `${role.bg} ${role.border} ring-2 ${role.ring} ring-offset-2 ring-offset-transparent`
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${role.accent}`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${isSelected ? role.text : 'text-white'}`}>{role.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{role.sublabel}</div>
                      </div>
                      {isSelected && (
                        <div className={`ml-auto w-5 h-5 rounded-full bg-gradient-to-br ${role.accent} flex items-center justify-center shrink-0`}>
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full mt-2 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 bg-gradient-to-r ${selected?.accent} shadow-xl transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]`}
            >
              เข้าสู่ระบบ
              <ArrowRight size={20} />
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              Demo Mode — ข้อมูลจะ reset เมื่อรีเฟรชหน้า
            </p>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 Naresuan University. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;