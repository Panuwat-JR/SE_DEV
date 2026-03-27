import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Trophy, Users, CheckSquare, Settings, X, Plus, Mail, Loader2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE as API_ORIGIN } from '../config/api';
import {
  eventStatusOptionsFor,
  eventStatusBadgeClass,
  toEventStatusSelectValue,
} from '../lib/eventStatuses';

const API_ROOT = `${API_ORIGIN}/api`;

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, tasks, updateEvent, deleteEvent, addTask } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newTask, setNewTask] = useState({
    task_name: '',
    status: 'รอดำเนินการ',
    priority: 'กลาง',
    category: 'ทั่วไป',
    due_date: '',
  });
  const [committeeDraft, setCommitteeDraft] = useState('');
  const [committeeSaving, setCommitteeSaving] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState('');
  const [applicantsPayload, setApplicantsPayload] = useState(null);
  const [remindLoading, setRemindLoading] = useState(false);

  const activity = events.find((e) => String(e.id) === String(id));

  useEffect(() => {
    setCommitteeDraft(activity?.committee_members ?? '');
  }, [activity?.id, activity?.committee_members]);

  if (!activity) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลกิจกรรม</p>
        <Link to="/employee/activities" className="text-blue-600 hover:underline">
          ← กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  const relatedTasks = tasks.filter((t) => String(t.event_id) === String(id));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editData) return;
    const start = editData.date_input || '';
    const end = editData.end_date_input || '';
    if (start && end && end < start) {
      window.alert('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
      return;
    }
    const payload = {
      ...editData,
      date_text: editData.date_input || editData.date_text,
      end_date_text: editData.end_date_input || '',
      description: editData.description ?? '',
      committee_members: editData.committee_members ?? '',
    };
    const r = await updateEvent(activity.id, payload);
    if (r?.ok === false) {
      window.alert(r.error || 'บันทึกไม่สำเร็จ');
      return;
    }
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`ลบกิจกรรม "${activity.title}" ?`)) {
      deleteEvent(activity.id);
      navigate('/employee/activities');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const name = String(newTask.task_name || '').trim();
    if (!name) {
      window.alert('กรุณาระบุชื่องาน');
      return;
    }
    const r = await addTask({
      task_name: name,
      event_id: activity.id,
      status: newTask.status,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.due_date,
    });
    if (r?.ok === false) {
      window.alert(r.error || 'สร้างงานไม่สำเร็จ');
      return;
    }
    setIsTaskOpen(false);
    setNewTask({
      task_name: '',
      status: 'รอดำเนินการ',
      priority: 'กลาง',
      category: 'ทั่วไป',
      due_date: '',
    });
  };

  const statusOpts = eventStatusOptionsFor(editData?.status ?? activity.status);

  const openApplicants = async () => {
    setApplicantsOpen(true);
    setApplicantsLoading(true);
    setApplicantsError('');
    setApplicantsPayload(null);
    try {
      const res = await fetch(`${API_ROOT}/activities/${activity.id}/applicants`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApplicantsError(data?.error || `โหลดไม่สำเร็จ (${res.status})`);
        return;
      }
      setApplicantsPayload(data);
    } catch (e) {
      setApplicantsError(e?.message || 'เชื่อมต่อไม่ได้');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const sendReminders = async () => {
    if (
      !window.confirm(
        `ส่งอีเมลแจ้งเตือนผู้สมัครทุกคนในโครงการ "${activity.title}" ?\n(ระบบจะบันทึกคำขอ — หากยังไม่ตั้ง SMTP จะเห็นรายชื่อใน log ของเซิร์ฟเวอร์)`
      )
    ) {
      return;
    }
    setRemindLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/activities/${activity.id}/remind-applicants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        window.alert(data?.error || `ส่งคำขอไม่สำเร็จ (${res.status})`);
        return;
      }
      window.alert(data?.message || 'ดำเนินการแล้ว');
    } catch (e) {
      window.alert(e?.message || 'เชื่อมต่อไม่ได้');
    } finally {
      setRemindLoading(false);
    }
  };

  const saveCommitteeOnly = async () => {
    setCommitteeSaving(true);
    try {
      const r = await updateEvent(activity.id, {
        title: activity.title,
        status: activity.status,
        date_text: activity.date_input || activity.date_text,
        end_date_text: activity.end_date_input || activity.end_date_text || '',
        description: activity.description ?? '',
        max_participants: activity.max_participants,
        prize_pool: activity.prize_pool,
        committee_members: committeeDraft,
      });
      if (r?.ok === false) {
        window.alert(r.error || 'บันทึกไม่สำเร็จ');
        return;
      }
      window.alert('บันทึกรายชื่อกรรมการแล้ว');
    } finally {
      setCommitteeSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="mb-6">
        <Link
          to="/employee/activities"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} /> กลับไปหน้ารายการกิจกรรม
        </Link>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border border-transparent ${eventStatusBadgeClass(activity.status)}`}
              >
                {activity.status}
              </span>
            </div>
            {activity.location && (
              <p className="text-gray-500 flex items-center gap-2">
                <MapPin size={16} /> {activity.location}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setEditData({
                  ...activity,
                  status: toEventStatusSelectValue(activity.status),
                  committee_members: activity.committee_members ?? '',
                });
                setIsEditOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
            >
              <Settings size={18} /> จัดการกิจกรรม
            </button>
            <button
              type="button"
              onClick={() => setIsTaskOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Plus size={18} /> สร้างงานในโครงการนี้
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium border border-red-200"
            >
              ลบกิจกรรม
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดโครงการ</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[80px]">
              {activity.description || 'ยังไม่มีการระบุรายละเอียด'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> กำหนดการ
            </h3>
            <div className="space-y-4">
              {[
                { label: 'เปิดรับสมัคร', date: activity.registration_start || '-', color: 'bg-blue-500' },
                { label: 'ปิดรับสมัคร', date: activity.registration_end || '-', color: 'bg-amber-500' },
                { label: 'วันจัดกิจกรรม', date: activity.date_text || '-', color: 'bg-emerald-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`} />
                  <span className="text-sm font-semibold text-gray-700 w-32">{item.label}</span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600/80 uppercase">เงินรางวัลรวม</p>
                <p className="text-xl font-bold text-amber-700">{activity.prize_pool || 'ไม่มีเงินรางวัล'}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" /> ผู้เข้าร่วม
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {activity.current_participants}/{activity.max_participants}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-sm font-bold text-gray-700 block">คณะกรรมการตัดสิน</span>
              <p className="text-xs text-gray-500">หนึ่งท่านต่อบรรทัด</p>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
                placeholder="เช่น ศ.ดร.สมชาย ใจดี"
                value={committeeDraft}
                onChange={(e) => setCommitteeDraft(e.target.value)}
              />
              <button
                type="button"
                disabled={committeeSaving}
                onClick={saveCommitteeOnly}
                className="w-full py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {committeeSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                บันทึกรายชื่อกรรมการ
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={openApplicants}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
              >
                ดูรายชื่อผู้สมัครทั้งหมด
              </button>
              <button
                type="button"
                disabled={remindLoading}
                onClick={sendReminders}
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {remindLoading ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Mail size={16} />}
                ส่งอีเมลแจ้งเตือนผู้สมัคร
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-gray-400" /> งานที่เกี่ยวข้อง ({relatedTasks.length})
              </span>
              <div className="space-y-2">
                {relatedTasks.length === 0 && (
                  <p className="text-xs text-gray-400">ยังไม่มีงานที่เกี่ยวข้อง — กด &quot;สร้างงานในโครงการนี้&quot;</p>
                )}
                {relatedTasks.map((task) => (
                  <Link
                    to={`/employee/tasks/${task.id}`}
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{task.task_name || task.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        task.status === 'เสร็จสิ้น'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'กำลังดำเนินการ'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">แก้ไขกิจกรรม</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={toEventStatusSelectValue(editData.status)}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  >
                    {statusOpts.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.prize_pool ?? ''}
                    onChange={(e) => setEditData({ ...editData, prize_pool: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่ม</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.date_input || ''}
                    onChange={(e) => setEditData({ ...editData, date_input: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.end_date_input || ''}
                    onChange={(e) => setEditData({ ...editData, end_date_input: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={editData.description ?? ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คณะกรรมการตัดสิน (หนึ่งท่านต่อบรรทัด)</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={editData.committee_members ?? ''}
                  onChange={(e) => setEditData({ ...editData, committee_members: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รับจำนวนผู้เข้าร่วม</label>
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.max_participants ?? 100}
                  onChange={(e) =>
                    setEditData({ ...editData, max_participants: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {applicantsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">รายชื่อผู้สมัคร</h3>
                <p className="text-sm text-gray-500">{activity.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setApplicantsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="ปิด"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {applicantsLoading && (
                <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
                  <Loader2 className="animate-spin" size={22} /> กำลังโหลด...
                </div>
              )}
              {!applicantsLoading && applicantsError && (
                <p className="text-red-600 text-sm text-center py-8">{applicantsError}</p>
              )}
              {!applicantsLoading && !applicantsError && applicantsPayload && (
                <>
                  {applicantsPayload.applicants?.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      ยังไม่มีผู้สมัครผ่านทีมที่ลงทะเบียนในกิจกรรมนี้ — ผูกทีมกับกิจกรรมที่หน้าทีม
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-gray-100 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="p-3 font-medium">ชื่อ</th>
                            <th className="p-3 font-medium">อีเมล</th>
                            <th className="p-3 font-medium">ทีม</th>
                            <th className="p-3 font-medium">โทรศัพท์</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {applicantsPayload.applicants.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50/80">
                              <td className="p-3 font-medium text-gray-800">
                                {[row.firstname, row.lastname].filter(Boolean).join(' ') || '—'}
                              </td>
                              <td className="p-3 text-gray-600">{row.email || '—'}</td>
                              <td className="p-3 text-gray-600">{row.team_name || '—'}</td>
                              <td className="p-3 text-gray-600">{row.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isTaskOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างงานในโครงการนี้</h2>
              <button type="button" onClick={() => setIsTaskOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                โครงการ: <strong className="text-gray-800">{activity.title}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่องาน *</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
                  placeholder="เช่น จัดเตรียมเอกสารประกอบโครงการ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="เร่งด่วนที่สุด">เร่งด่วนที่สุด</option>
                    <option value="สูง">สูง</option>
                    <option value="กลาง">กลาง</option>
                    <option value="ต่ำ">ต่ำ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    <option value="ทั่วไป">ทั่วไป</option>
                    <option value="ประสานงาน">ประสานงาน</option>
                    <option value="สถานที่">สถานที่</option>
                    <option value="เอกสาร">เอกสาร</option>
                    <option value="การตลาด">การตลาด</option>
                    <option value="โลจิสติกส์">โลจิสติกส์</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ครบกำหนด</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTaskOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  สร้างงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetail;
