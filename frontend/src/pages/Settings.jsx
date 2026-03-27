import React, { useCallback, useEffect, useState } from 'react';
import { User, Bell, Shield, Palette, Database, Save, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE as API_ORIGIN } from '../config/api';

const API_ROOT = `${API_ORIGIN}/api`;

const LS_NOTIFY = 'nu_seed_employee_notify_v1';
const LS_DISPLAY = 'nu_seed_employee_display_v1';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

const Settings = () => {
  const { employee, mergeEmployeeSession } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');

  const [notify, setNotify] = useState(() =>
    loadJson(LS_NOTIFY, {
      taskAlerts: true,
      projectNews: true,
      weeklyDigest: false,
    })
  );
  const [display, setDisplay] = useState(() =>
    loadJson(LS_DISPLAY, {
      compactTables: false,
      reduceMotion: false,
    })
  );

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const refreshFromServer = useCallback(async () => {
    if (!employee?.id) return;
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await fetch(`${API_ROOT}/employees/${employee.id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setFirstName(data.first_name ?? '');
      setLastName(data.last_name ?? '');
      setGender(data.gender ?? '');
    } catch (e) {
      setLoadErr(e.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [employee?.id]);

  useEffect(() => {
    if (!employee?.id) return;
    setFirstName(employee.first_name || '');
    setLastName(employee.last_name || '');
    refreshFromServer();
  }, [
    employee?.id,
    employee?.first_name,
    employee?.last_name,
    refreshFromServer,
  ]);

  useEffect(() => {
    saveJson(LS_NOTIFY, notify);
  }, [notify]);

  useEffect(() => {
    saveJson(LS_DISPLAY, display);
    try {
      document.documentElement.dataset.compactUi = display.compactTables ? '1' : '0';
      document.documentElement.dataset.reduceMotion = display.reduceMotion ? '1' : '0';
    } catch {
      /* ignore */
    }
  }, [display]);

  const menuItems = [
    { id: 'profile', name: 'โปรไฟล์', icon: <User size={18} /> },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: <Bell size={18} /> },
    { id: 'security', name: 'ความปลอดภัย', icon: <Shield size={18} /> },
    { id: 'theme', name: 'การแสดงผล', icon: <Palette size={18} /> },
    { id: 'backup', name: 'ข้อมูลและสำรอง', icon: <Database size={18} /> },
  ];

  const flashOk = (text) => {
    setErr(null);
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!employee?.id) {
      setErr('ไม่พบรหัสพนักงานในเซสชัน — ออกจากระบบแล้วเข้าใหม่');
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          gender: gender.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      mergeEmployeeSession({
        first_name: data.first_name,
        last_name: data.last_name,
        initial: data.initial,
      });
      flashOk('บันทึกโปรไฟล์แล้ว');
    } catch (e2) {
      setErr(e2.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!employee?.id) {
      setErr('ไม่พบรหัสพนักงานในเซสชัน');
      return;
    }
    if (newPw.length < 6) {
      setErr('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPw !== confirmPw) {
      setErr('รหัสผ่านใหม่กับยืนยันไม่ตรงกัน');
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: curPw,
          password: newPw,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCurPw('');
      setNewPw('');
      setConfirmPw('');
      flashOk('เปลี่ยนรหัสผ่านแล้ว');
    } catch (e2) {
      setErr(e2.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const saveNotifyPrefs = () => {
    saveJson(LS_NOTIFY, notify);
    flashOk('บันทึกการตั้งค่าการแจ้งเตือนแล้ว (เก็บในเบราว์เซอร์ของคุณ)');
  };

  const saveDisplayPrefs = () => {
    saveJson(LS_DISPLAY, display);
    flashOk('บันทึกการแสดงผลแล้ว');
  };

  const exportSessionInfo = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      role: 'employee',
      employee: employee
        ? {
            id: employee.id,
            email: employee.email,
            first_name: employee.first_name,
            last_name: employee.last_name,
            role: employee.role,
            department: employee.department,
          }
        : null,
      note: 'ไฟล์นี้ไม่มีรหัสผ่าน — ใช้สำหรับสำรองข้อมูลตัวตนที่แสดงในระบบเท่านั้น',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nu-seed-employee-backup-${employee?.id || 'session'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flashOk('ดาวน์โหลดไฟล์สำรองแล้ว');
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50/80 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  );

  return (
    <div className="max-w-5xl mx-auto font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ตั้งค่า</h1>
        <p className="text-gray-500 text-sm">
          จัดการโปรไฟล์ การแจ้งเตือน และความปลอดภัยของบัญชีพนักงาน (เชื่อมกับ API เดียวกับหน้าพนักงาน)
        </p>
      </div>

      {(msg || err || loadErr) && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            err || loadErr
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
          }`}
        >
          {err || loadErr || msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setErr(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">โปรไฟล์</h2>
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-blue-600 font-bold text-xl">
                  {(firstName || employee?.first_name || '?').toString().charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">รูปโปรไฟล์</p>
                  <p className="text-xs text-gray-500 mt-1">
                    การอัปโหลดรูปยังไม่เปิดในระบบนี้ — ใช้ตัวอักษรย่อจากชื่อแทน
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={saveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ชื่อ</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">นามสกุล</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">อีเมล (ล็อกอิน)</label>
                    <input
                      type="email"
                      value={employee?.email || ''}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-gray-50"
                    />
                    <p className="text-[11px] text-gray-400">
                      เปลี่ยนอีเมลได้จากผู้ดูแลระบบหรือฝ่ายทะเบียน — ไม่ให้แก้เองเพื่อกันสับสนกับล็อกอิน
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">เพศ</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      <option value="">ไม่ระบุ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
                    <input
                      type="text"
                      readOnly
                      value={employee?.role || '—'}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">แผนก</label>
                    <input
                      type="text"
                      readOnly
                      value={employee?.department || '—'}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !employee?.id}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">การแจ้งเตือน</h2>
              <p className="text-sm text-gray-500">
                ตั้งค่าความสนใจการแจ้งเตือนในอินเทอร์เฟซ (เก็บในเบราว์เซอร์) — พร้อมต่อระบบส่งอีเมล/แอปในอนาคต
              </p>
              <div className="space-y-2">
                <Toggle
                  checked={notify.taskAlerts}
                  onChange={(v) => setNotify((n) => ({ ...n, taskAlerts: v }))}
                  label="งานที่ได้รับมอบหมายและครบกำหนด"
                  desc="แสดงการเน้นงานเร่งด่วนใน workspace"
                />
                <Toggle
                  checked={notify.projectNews}
                  onChange={(v) => setNotify((n) => ({ ...n, projectNews: v }))}
                  label="ข่าวสารโครงการที่รับผิดชอบ"
                  desc="ใช้ร่วมกับแดชบอร์ดและปฏิทิน"
                />
                <Toggle
                  checked={notify.weeklyDigest}
                  onChange={(v) => setNotify((n) => ({ ...n, weeklyDigest: v }))}
                  label="สรุปรายสัปดาห์ (เมื่อเปิดใช้งาน)"
                  desc="placeholder สำหรับอีเมลสรุปภายหลัง"
                />
              </div>
              <button
                type="button"
                onClick={saveNotifyPrefs}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">ความปลอดภัย</h2>
              <p className="text-sm text-gray-500">
                เปลี่ยนรหัสผ่านบัญชีพนักงาน — ต้องกรอกรหัสผ่านปัจจุบันให้ถูกต้อง (ตรวจที่เซิร์ฟเวอร์)
              </p>
              <form className="space-y-4 max-w-md" onSubmit={savePassword}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !employee?.id}
                  className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก…' : 'อัปเดตรหัสผ่าน'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">การแสดงผล</h2>
              <p className="text-sm text-gray-500">
                ปรับความหนาแน่นของรายการและการเคลื่อนไหว — เก็บในเบราว์เซอร์
              </p>
              <div className="space-y-2">
                <Toggle
                  checked={display.compactTables}
                  onChange={(v) => setDisplay((d) => ({ ...d, compactTables: v }))}
                  label="โหมดกะทัดรัด (ตาราง/รายการ)"
                  desc="ตั้งค่า data-compact-ui ที่ root สำหรับธีมในอนาคต"
                />
                <Toggle
                  checked={display.reduceMotion}
                  onChange={(v) => setDisplay((d) => ({ ...d, reduceMotion: v }))}
                  label="ลดการเคลื่อนไหว"
                  desc="เหมาะกับผู้ใช้ที่ต้องการ UI นิ่งขึ้น"
                />
              </div>
              <button
                type="button"
                onClick={saveDisplayPrefs}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">ข้อมูลและสำรอง</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                ข้อมูลโครงการ งาน และเอกสารหลักเก็บในฐานข้อมูลขององค์กร ไม่ได้อยู่ในไฟล์ส่งออกนี้
                คุณสามารถดาวน์โหลดสรุปตัวตนที่แสดงในเซสชันปัจจุบัน (ไม่มีรหัสผ่าน) เพื่อเก็บไว้อ้างอิง
              </p>
              <button
                type="button"
                onClick={exportSessionInfo}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Download size={18} />
                ดาวน์โหลด JSON สำรองเซสชัน
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
