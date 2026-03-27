import React, { useEffect, useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Save,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  participantFetch,
  getParticipantFirstname,
  getParticipantFetchErrorMessage,
} from '../../lib/participantApi';

const LS_NOTIFY = 'nu_seed_participant_notify_v1';
const LS_DISPLAY = 'nu_seed_participant_display_v1';

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

export default function P_Settings() {
  const {
    participantProfile,
    participantProfileLoading,
    refreshParticipantProfile,
    syncParticipantLoginFirstname,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [notify, setNotify] = useState(() =>
    loadJson(LS_NOTIFY, {
      projectUpdates: true,
      deadlineReminders: true,
      teamMessages: true,
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

  useEffect(() => {
    if (!participantProfile) return;
    setFirstname(participantProfile.firstname ?? '');
    setLastname(participantProfile.lastname ?? '');
    setEmail(participantProfile.email ?? '');
    setYear(
      participantProfile.year != null && participantProfile.year !== ''
        ? String(participantProfile.year)
        : ''
    );
    setPhone(participantProfile.phoneNumber ?? '');
    setGender(participantProfile.gender ?? '');
  }, [participantProfile]);

  useEffect(() => {
    saveJson(LS_NOTIFY, notify);
  }, [notify]);

  useEffect(() => {
    saveJson(LS_DISPLAY, display);
    try {
      document.documentElement.dataset.participantCompactUi = display.compactTables
        ? '1'
        : '0';
      document.documentElement.dataset.participantReduceMotion = display.reduceMotion
        ? '1'
        : '0';
    } catch {
      /* ignore */
    }
  }, [display]);

  const flashOk = (text) => {
    setErr(null);
    setMsg(text);
    setTimeout(() => setMsg(null), 4000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('ไฟล์ต้องเป็นรูปภาพเท่านั้น');
      return;
    }
    setErr(null);
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await participantFetch('/api/participants-data/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      await refreshParticipantProfile();
      flashOk('เปลี่ยนรูปโปรไฟล์แล้ว');
    } catch (e) {
      setErr(getParticipantFetchErrorMessage(e, e.message || 'อัปโหลดรูปไม่สำเร็จ'));
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      let yearPayload = null;
      if (year.trim() !== '') {
        const y = Number.parseInt(year, 10);
        if (Number.isNaN(y)) {
          setErr('ชั้นปีต้องเป็นตัวเลข');
          setLoading(false);
          return;
        }
        yearPayload = y;
      }

      const body = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim().toLowerCase(),
        year_of_study: yearPayload,
        phone_number: phone.trim() || null,
        gender: gender.trim() || null,
      };
      if (!body.firstname) {
        setErr('กรุณาระบุชื่อ');
        setLoading(false);
        return;
      }

      const res = await participantFetch('/api/participants-data/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const prevKey = getParticipantFirstname();
      if (data.firstname && data.firstname !== prevKey) {
        syncParticipantLoginFirstname(data.firstname);
      }
      await refreshParticipantProfile();
      flashOk('บันทึกโปรไฟล์แล้ว');
    } catch (e) {
      setErr(getParticipantFetchErrorMessage(e, e.message || 'บันทึกไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
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
      const res = await participantFetch('/api/participants-data/account/password', {
        method: 'PATCH',
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
    } catch (e) {
      setErr(getParticipantFetchErrorMessage(e, e.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ'));
    } finally {
      setLoading(false);
    }
  };

  const saveNotifyPrefs = () => {
    saveJson(LS_NOTIFY, notify);
    flashOk('บันทึกการตั้งค่าการแจ้งเตือนแล้ว (เก็บในเบราว์เซอร์)');
  };

  const saveDisplayPrefs = () => {
    saveJson(LS_DISPLAY, display);
    flashOk('บันทึกการแสดงผลแล้ว');
  };

  const exportSessionInfo = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      role: 'participant',
      participantFirstnameKey: getParticipantFirstname(),
      profile: participantProfile
        ? {
            displayName: participantProfile.displayName,
            email: participantProfile.email,
            teamName: participantProfile.teamName,
            faculty: participantProfile.faculty,
          }
        : null,
      note: 'ไม่มีรหัสผ่าน — ข้อมูลโครงการ/เอกสารอยู่ในฐานข้อมูล',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nu-seed-participant-backup.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flashOk('ดาวน์โหลดไฟล์สำรองแล้ว');
  };

  const Toggle = ({ checked, onChange, label, desc }) => (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-sky-200 text-sky-600 focus:ring-sky-500"
      />
      <div>
        <div className="text-sm font-medium text-slate-900">{label}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  );

  const menuItems = [
    { id: 'profile', name: 'โปรไฟล์', icon: <User size={18} /> },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: <Bell size={18} /> },
    { id: 'security', name: 'ความปลอดภัย', icon: <Shield size={18} /> },
    { id: 'theme', name: 'การแสดงผล', icon: <Palette size={18} /> },
    { id: 'backup', name: 'ข้อมูลและสำรอง', icon: <Database size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">ตั้งค่า</h1>
        <p className="text-slate-600 text-sm">
          แก้โปรไฟล์ อีเมล และรหัสผ่าน — เชื่อมกับ{' '}
          <code className="text-xs bg-sky-100 px-1 rounded">PATCH /api/participants-data</code>{' '}
          เหมือนระบบหลัก
        </p>
      </div>

      {(msg || err) && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            err
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
          }`}
        >
          {err || msg}
        </div>
      )}

      {participantProfileLoading && !participantProfile && (
        <p className="text-sm text-slate-500 mb-4">กำลังโหลดโปรไฟล์…</p>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-2">
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
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-600 hover:bg-sky-50'
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
            <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">โปรไฟล์</h2>
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-sky-100">
                <label className="relative cursor-pointer group shrink-0">
                  {participantProfile?.profileImage ? (
                    <img
                      src={participantProfile.profileImage}
                      alt="โปรไฟล์"
                      className="w-16 h-16 rounded-full object-cover border border-sky-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center border border-sky-200 text-sky-700 font-bold text-xl">
                      {(firstname || participantProfile?.initial || '?').toString().charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">{avatarUploading ? '…' : 'เปลี่ยนรูป'}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={handleAvatarChange}
                  />
                </label>
                <div>
                  <p className="text-sm font-medium text-slate-800">ผู้เข้าร่วมโครงการ</p>
                  <p className="text-xs text-slate-500 mt-1">
                    คลิกที่รูปเพื่อเปลี่ยนรูปโปรไฟล์ (ไม่เกิน 5 MB) — ชื่อจริง (firstname) ใช้เป็นตัวระบุตัวตนกับ API
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={saveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชื่อ (firstname)</label>
                    <input
                      type="text"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">นามสกุล</label>
                    <input
                      type="text"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">อีเมล</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">เบอร์โทร</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">ชั้นปี</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="เช่น 3"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">เพศ</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                    >
                      <option value="">ไม่ระบุ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-600">
                  <div>
                    <span className="font-medium text-slate-700">คณะ: </span>
                    {participantProfile?.faculty || '—'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">ทีม: </span>
                    {participantProfile?.teamName || '—'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || participantProfileLoading}
                  className="bg-sky-500 text-white px-6 py-2.5 rounded-lg inline-flex items-center gap-2 hover:bg-sky-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">การแจ้งเตือน</h2>
              <p className="text-sm text-slate-600">
                เก็บความชอบในเบราว์เซอร์ — ใช้ร่วมกับหน้าแจ้งเตือนและการแสดงผลในอนาคต
              </p>
              <div className="space-y-2">
                <Toggle
                  checked={notify.projectUpdates}
                  onChange={(v) => setNotify((n) => ({ ...n, projectUpdates: v }))}
                  label="อัปเดตความคืบหน้าโครงการ"
                />
                <Toggle
                  checked={notify.deadlineReminders}
                  onChange={(v) => setNotify((n) => ({ ...n, deadlineReminders: v }))}
                  label="เตือนกำหนดส่งงาน / เอกสาร"
                />
                <Toggle
                  checked={notify.teamMessages}
                  onChange={(v) => setNotify((n) => ({ ...n, teamMessages: v }))}
                  label="กิจกรรมทีมและข้อความจากผู้จัด"
                />
              </div>
              <button
                type="button"
                onClick={saveNotifyPrefs}
                className="bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sky-600"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-6 md:p-8 space-y-5">
              <h2 className="text-lg font-bold text-slate-900">ความปลอดภัย</h2>
              <p className="text-sm text-slate-600">
                เปลี่ยนรหัสผ่านบัญชีผู้เข้าร่วม — ต้องกรอกรหัสปัจจุบันให้ถูกต้อง
              </p>
              <form className="space-y-4 max-w-md" onSubmit={savePassword}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก…' : 'อัปเดตรหัสผ่าน'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">การแสดงผล</h2>
              <p className="text-sm text-slate-600">ปรับความหนาแน่นและการเคลื่อนไหว (เก็บในเบราว์เซอร์)</p>
              <div className="space-y-2">
                <Toggle
                  checked={display.compactTables}
                  onChange={(v) => setDisplay((d) => ({ ...d, compactTables: v }))}
                  label="โหมดกะทัดรัด"
                />
                <Toggle
                  checked={display.reduceMotion}
                  onChange={(v) => setDisplay((d) => ({ ...d, reduceMotion: v }))}
                  label="ลดการเคลื่อนไหว"
                />
              </div>
              <button
                type="button"
                onClick={saveDisplayPrefs}
                className="bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sky-600"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="bg-white rounded-xl border border-sky-100 shadow-sm p-6 md:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลและสำรอง</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                โครงการ เอกสาร และทีมอยู่ในฐานข้อมูล — ดาวน์โหลดได้เฉพาะสรุปตัวตนในเซสชัน (ไม่มีรหัสผ่าน)
              </p>
              <button
                type="button"
                onClick={exportSessionInfo}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50"
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
}
