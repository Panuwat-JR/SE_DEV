import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCog, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import {
    getDefaultParticipantFirstname,
    setParticipantFirstname,
} from '../lib/participantApi';

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

const demoPassword =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_PASSWORD
    ? String(import.meta.env.VITE_DEMO_PASSWORD)
    : 'password123';

const Login = () => {
  const navigate = useNavigate();
  const { login, role: sessionRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState('employee');
  const [participantFirstname, setParticipantFirstnameInput] = useState(
    () => getDefaultParticipantFirstname()
  );
  const [employeeEmail, setEmployeeEmail] = useState(() => {
    const env =
      typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEMO_EMPLOYEE_EMAIL
        ? String(import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL).trim()
        : '';
    return env || 'somchai@demo.nu.seed';
  });
  const [password, setPassword] = useState(demoPassword);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionRole) return;
    const to =
      sessionRole === 'participant'
        ? '/participant/dashboard'
        : sessionRole === 'executive'
          ? '/executive/dashboard'
          : '/employee/dashboard';
    navigate(to, { replace: true });
  }, [sessionRole, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const roleCfg = ROLES.find(r => r.id === selectedRole);
    const apiRoot = API_BASE ? `${API_BASE}/api` : '/api';
    setSubmitting(true);
    try {
      const res = await fetch(`${apiRoot}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          password: String(password || ''),
          participantFirstname:
            selectedRole === 'participant' ? String(participantFirstname || '').trim() : undefined,
          employeeEmail:
            selectedRole === 'employee' || selectedRole === 'executive'
              ? String(employeeEmail || '').trim().toLowerCase()
              : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
      if (selectedRole === 'participant') {
        const name = String(data.participantFirstname || participantFirstname || '').trim();
        if (name) setParticipantFirstname(name);
      }
      login({
        role: selectedRole,
        employee: data.employee,
        participantFirstname:
          selectedRole === 'participant'
            ? String(data.participantFirstname || participantFirstname || '').trim()
            : undefined,
      });
      navigate(roleCfg.redirect);
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
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

            {selectedRole === 'participant' && (
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 space-y-2">
                <label className="block text-xs font-medium text-sky-200">
                  ชื่อจริงในฐานข้อมูล (firstname)
                </label>
                <input
                  type="text"
                  value={participantFirstname}
                  onChange={(e) => setParticipantFirstnameInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a]/80 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder={getDefaultParticipantFirstname()}
                  autoComplete="given-name"
                />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  ต้องตรงกับคอลัมน์ <span className="text-gray-400">participant_profiles.firstname</span> เพื่อดึงทีมและโครงการให้ตรง
                </p>
              </div>
            )}

            {(selectedRole === 'employee' || selectedRole === 'executive') && (
              <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 space-y-2">
                <label className="block text-xs font-medium text-blue-200">
                  อีเมลพนักงาน (employees.email)
                </label>
                <input
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0f172a]/80 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="somchai@demo.nu.seed"
                  autoComplete="email"
                />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  พนักงาน: somchai@demo.nu.seed — ผู้บริหาร: exec@demo.nu.seed (หรือ kanda@se.dev หลัง employee_seed)
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 space-y-2">
              <label className="block text-xs font-medium text-gray-200">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0f172a]/80 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="password123"
                autoComplete="current-password"
              />
              <p className="text-[11px] text-gray-500 leading-relaxed">
                เดโม seed ใช้รหัสเดียวกันทุกบัญชี — ดูสรุปหลังรัน ./start.sh
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full mt-2 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2.5 bg-gradient-to-r ${selected?.accent} shadow-xl transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none`}
            >
              {submitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              <ArrowRight size={20} />
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              บทบาท ตัวตน และรหัสผ่านตรวจที่ API — ข้อมูลเซสชัน (ไม่มีรหัสผ่าน) เก็บในเบราว์เซอร์หลังรีเฟรช
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