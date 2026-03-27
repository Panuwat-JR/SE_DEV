import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Edit, Trash2, Clock, Trophy, Eye, X, Upload, File, Users, CalendarDays, MapPin, CheckCircle2, FileText, ChevronRight, Mail, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE as API_ORIGIN } from '../config/api';

const API_ROOT = `${API_ORIGIN}/api`;
import {
  EVENT_STATUS_OPTIONS,
  eventStatusBadgeClass,
  eventStatusOptionsFor,
  toEventStatusSelectValue,
} from '../lib/eventStatuses';

function Activities() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [committeeDraft, setCommitteeDraft] = useState('');
  const [committeeSaving, setCommitteeSaving] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState('');
  const [applicantsPayload, setApplicantsPayload] = useState(null);
  const [remindLoading, setRemindLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    status: 'เปิดรับสมัคร',
    date_text: '',
    end_date_input: '',
    description: '',
    max_participants: 100,
    prize_pool: '',
    committee_members: '',
    fileName: '',
  });
  const activityFileInputRef = useRef(null);

  useEffect(() => {
    setSelectedActivity((prev) => {
      if (!prev) return prev;
      const fresh = events.find((e) => String(e.id) === String(prev.id));
      return fresh ?? prev;
    });
  }, [events]);

  useEffect(() => {
    setCommitteeDraft(selectedActivity?.committee_members ?? '');
  }, [selectedActivity?.id, selectedActivity?.committee_members]);

  useEffect(() => {
    if (!selectedActivity) {
      setApplicantsOpen(false);
      setApplicantsPayload(null);
    }
  }, [selectedActivity]);

  const handleActivityFileDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleActivityFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    setNewActivity((prev) => ({ ...prev, fileName: f.name }));
    try {
      const dt = new DataTransfer();
      dt.items.add(f);
      if (activityFileInputRef.current) activityFileInputRef.current.files = dt.files;
    } catch {
      /* ignore */
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${title}" ?`)) {
      deleteEvent(id);
    }
  };

  const handleOpenEdit = (activity) => {
    setSelectedActivity(null);
    setApplicantsOpen(false);
    setEditingActivity({
      ...activity,
      status: toEventStatusSelectValue(activity.status),
      committee_members: activity.committee_members ?? '',
    });
    setIsEditModalOpen(true);
  };

  const openApplicants = async () => {
    if (!selectedActivity) return;
    setApplicantsOpen(true);
    setApplicantsLoading(true);
    setApplicantsError('');
    setApplicantsPayload(null);
    try {
      const res = await fetch(`${API_ROOT}/activities/${selectedActivity.id}/applicants`);
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
    if (!selectedActivity) return;
    if (
      !window.confirm(
        `ส่งอีเมลแจ้งเตือนผู้สมัครทุกคนในโครงการ "${selectedActivity.title}" ?\n(ระบบจะบันทึกคำขอ — หากยังไม่ตั้ง SMTP จะเห็นรายชื่อใน log ของเซิร์ฟเวอร์)`
      )
    ) {
      return;
    }
    setRemindLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/activities/${selectedActivity.id}/remind-applicants`, {
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
    if (!selectedActivity) return;
    setCommitteeSaving(true);
    try {
      const r = await updateEvent(selectedActivity.id, {
        title: selectedActivity.title,
        status: selectedActivity.status,
        date_text: selectedActivity.date_input || selectedActivity.date_text,
        end_date_text: selectedActivity.end_date_input || selectedActivity.end_date_text || '',
        description: selectedActivity.description ?? '',
        max_participants: selectedActivity.max_participants,
        prize_pool: selectedActivity.prize_pool,
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

  const buildActivityUpdatePayload = (activity) => ({
    title: activity.title,
    status: activity.status,
    date_text: activity.date_input || activity.date_text,
    end_date_text: activity.end_date_input || activity.end_date_text || '',
    description: activity.description ?? '',
    max_participants: activity.max_participants,
    prize_pool: activity.prize_pool,
    committee_members: activity.committee_members ?? '',
  });

  const saveActivityStatusFromDetail = async (nextStatus) => {
    if (!selectedActivity || !nextStatus) return;
    setStatusSaving(true);
    try {
      const r = await updateEvent(selectedActivity.id, {
        ...buildActivityUpdatePayload({ ...selectedActivity, status: nextStatus }),
      });
      if (r?.ok === false) {
        window.alert(r.error || 'อัปเดตสถานะไม่สำเร็จ');
        return;
      }
      setSelectedActivity((prev) => (prev ? { ...prev, status: nextStatus } : null));
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const start = editingActivity.date_input || '';
    const end = editingActivity.end_date_input || '';
    if (start && end && end < start) {
      window.alert('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
      return;
    }
    const payload = buildActivityUpdatePayload(editingActivity);
    const r = await updateEvent(editingActivity.id, payload);
    if (r?.ok === false) {
      window.alert(r.error || 'บันทึกไม่สำเร็จ');
      return;
    }
    setIsEditModalOpen(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const start = newActivity.date_text || '';
    const end = newActivity.end_date_input || '';
    if (start && end && end < start) {
      window.alert('วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น');
      return;
    }
    const r = await addEvent({
      title: newActivity.title,
      status: newActivity.status,
      date_text: newActivity.date_text,
      end_date_text: newActivity.end_date_input || '',
      description: newActivity.description || '',
      max_participants: Number(newActivity.max_participants),
      prize_pool: newActivity.prize_pool || 'ไม่มีเงินรางวัล',
      committee_members: newActivity.committee_members || '',
    });
    if (r?.ok === false) {
      window.alert(r.error || 'สร้างกิจกรรมไม่สำเร็จ');
      return;
    }
    setIsCreateModalOpen(false);
    setNewActivity({
      title: '',
      status: 'เปิดรับสมัคร',
      date_text: '',
      end_date_input: '',
      description: '',
      max_participants: 100,
      prize_pool: '',
      committee_members: '',
      fileName: '',
    });
  };

  const normStatus = (s) => toEventStatusSelectValue(s);
  const filteredActivities = events.filter((activity) => {
    if (!activity.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter && normStatus(activity.status) !== statusFilter) return false;
    return true;
  });

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการกิจกรรม</h1>
          <p className="text-sm text-gray-500 mt-1">รายการกิจกรรมทั้งหมด ทั้งที่กำลังดำเนินการและที่ผ่านมาแล้ว</p>
        </div>
        <button
          onClick={() => {
            setSelectedActivity(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus size={18} /> สร้างกิจกรรมใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อกิจกรรม..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-w-[11rem]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="กรองตามสถานะ"
          >
            <option value="">ทุกสถานะ</option>
            {EVENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium">ชื่อกิจกรรม</th>
                <th className="p-4 font-medium">วันที่จัด</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium">ผู้เข้าร่วม</th>
                <th className="p-4 font-medium">เงินรางวัล</th>
                <th className="p-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-semibold text-gray-800">
                    <button onClick={() => setSelectedActivity(activity)} className="hover:text-blue-600 transition-colors text-left">
                      {activity.title}
                    </button>
                  </td>
                  <td className="p-4 text-gray-500">
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {activity.date_text || 'ยังไม่ระบุ'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${eventStatusBadgeClass(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-12">{activity.current_participants}/{activity.max_participants}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5"><Trophy size={14} className="text-gray-400" /> {activity.prize_pool || 'ไม่ระบุ'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedActivity(activity)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="ดูรายละเอียด">
                        <Eye size={16} className="pointer-events-none" />
                      </button>
                      <button onClick={() => handleOpenEdit(activity)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="แก้ไข">
                        <Edit size={16} className="pointer-events-none" />
                      </button>
                      <button onClick={() => handleDelete(activity.id, activity.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="ลบ">
                        <Trash2 size={16} className="pointer-events-none" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่พบข้อมูลกิจกรรม</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 shrink-0">
          <div>แสดง {filteredActivities.length} รายการ</div>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">ก่อนหน้า</button>
            <button className="px-2 py-1 border border-gray-200 rounded bg-blue-50 text-blue-600 font-medium">1</button>
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">ถัดไป</button>
          </div>
        </div>
      </div>

      {/* Modal ดูรายละเอียด + รายชื่อผู้สมัคร — portal ไป body กันโดน parent overflow/stacking บังคลิก */}
      {typeof document !== 'undefined' &&
        selectedActivity &&
        createPortal(
          <>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] pointer-events-auto">

            {/* Header คล้ายแบนเนอร์ */}
            <div className="relative bg-gradient-to-br from-blue-700 to-indigo-900 px-8 py-10 shrink-0 overflow-hidden">
              {/* Decorative background elements */}
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden />
              <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" aria-hidden />

              <div className="relative z-10 flex justify-between items-start">
                <div className="text-white space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm border ${selectedActivity.status === 'กำลังดำเนินการ' ? 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30' :
                      selectedActivity.status === 'เปิดรับสมัคร' ? 'bg-blue-400/20 text-blue-100 border-blue-400/30' :
                        selectedActivity.status === 'เสร็จสิ้น' || selectedActivity.status === 'ดำเนินการสำเร็จ' ? 'bg-white/20 text-white border-white/30' :
                          'bg-amber-400/20 text-amber-100 border-amber-400/30'
                      }`}>
                      สถานะ: {selectedActivity.status}
                    </span>
                    <span className="text-sm font-medium text-blue-100 bg-black/20 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                      <CalendarDays size={14} /> {selectedActivity.date_text || 'ยังไม่ระบุวันที่'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-extrabold tracking-tight">{selectedActivity.title}</h2>
                  <p className="text-blue-100 text-lg max-w-2xl opacity-90 leading-relaxed">
                    {(selectedActivity.description || '').trim()
                      ? selectedActivity.description
                      : `รายละเอียดจากระบบ — แก้ไขกิจกรรมเพื่อเพิ่มคำอธิบายในรายการโครงการ`}
                  </p>
                </div>
                <button onClick={() => setSelectedActivity(null)} className="text-white/60 hover:text-white bg-black/10 hover:bg-black/20 p-2.5 rounded-full transition-all backdrop-blur-sm">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden bg-gray-50/50">
              {/* Left Column (Main Info) */}
              <div className="w-2/3 p-8 overflow-y-auto border-r border-gray-100 bg-white">

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-inner"><Trophy size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">เงินรางวัลรวม</p>
                      <p className="text-xl font-extrabold text-amber-900">{selectedActivity.prize_pool || 'ไม่มีข้อมูล'}</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-inner"><MapPin size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">สถานที่จัดงาน</p>
                      <p className="text-xl font-extrabold text-blue-900">อุทยานวิทยาศาสตร์ ภาคใต้</p>
                    </div>
                  </div>
                </div>

                {/* About & Schedule */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <FileText size={20} className="text-blue-600" /> ข้อมูลทั่วไป
                    </h3>
                    <div className="text-gray-600 text-sm leading-relaxed space-y-4">
                      <p>กิจกรรม {selectedActivity.title} เป็นโครงการที่จัดขึ้นเพื่อส่งเสริมและสนับสนุนผู้มีความคิดสร้างสรรค์ โดยมุ่งเน้นที่การนำเทคโนโลยีมาแก้ปัญหาในระดับภูมิภาค</p>
                      <ul className="list-inside space-y-2">
                        <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> <span className="text-gray-700">เสริมสร้างทักษะการทำงานเป็นทีม (Team Building)</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> <span className="text-gray-700">ได้รับการอบรมจาก Mentor ผู้เชี่ยวชาญในวงการธุรกิจและ Tech</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> <span className="text-gray-700">โอกาสในการต่อยอดนำแผนธุรกิจไปใช้จริง</span></li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Clock size={20} className="text-blue-600" /> กำหนดการจากระบบ
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {(() => {
                        const items = [];
                        if ((selectedActivity.registration_start || '').trim()) {
                          items.push({
                            date: selectedActivity.registration_start,
                            title: 'เปิดรับสมัคร',
                            desc: 'จากวันที่ในระบบ (registration_start_date)',
                          });
                        }
                        if ((selectedActivity.registration_end || '').trim()) {
                          items.push({
                            date: selectedActivity.registration_end,
                            title: 'ปิดรับสมัคร',
                            desc: 'จากวันที่ในระบบ (registration_end_date)',
                          });
                        }
                        if (selectedActivity.date_text && selectedActivity.date_text !== 'ยังไม่ระบุวันที่') {
                          items.push({
                            date: selectedActivity.date_text,
                            title: 'วันเริ่มโครงการ / จัดกิจกรรม',
                            desc: 'จาก event_start_date ในระบบ',
                          });
                        }
                        if ((selectedActivity.end_date_text || '').trim()) {
                          items.push({
                            date: selectedActivity.end_date_text,
                            title: 'วันสิ้นสุดโครงการ',
                            desc: 'จากวันที่สิ้นสุดในระบบ',
                          });
                        }
                        if (items.length === 0) {
                          items.push({
                            date: '—',
                            title: 'ยังไม่มีกำหนดการละเอียด',
                            desc: 'แก้ไขกิจกรรมเพื่อระบุวันที่เริ่มและสิ้นสุด',
                          });
                        }
                        return items;
                      })().map((timeline, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:even:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <span className="font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-gray-800">{timeline.title}</div>
                              <time className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{timeline.date}</time>
                            </div>
                            <div className="text-sm text-gray-500">{timeline.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* Right Column (Metrics & Judges) */}
              <div className="w-1/3 p-6 overflow-y-auto">
                <div className="space-y-6">

                  {/* Participant Progress */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Users size={16} className="text-gray-400" /> จำนวนผู้สมัคร</span>
                      <span className="text-xs font-medium text-gray-500">{selectedActivity.current_participants} / {selectedActivity.max_participants} คน</span>
                    </h4>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full relative" style={{ width: `${Math.min((selectedActivity.current_participants / selectedActivity.max_participants) * 100, 100)}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      เหลือที่นั่งอีก <span className="font-bold text-gray-800">{selectedActivity.max_participants - selectedActivity.current_participants}</span> ที่
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <h4 className="text-sm font-bold text-gray-800">คณะกรรมการตัดสิน</h4>
                    <p className="text-xs text-gray-500">ระบุชื่อหนึ่งท่านต่อหนึ่งบรรทัด แล้วกดบันทึก</p>
                    <textarea
                      rows={5}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
                      placeholder="เช่น&#10;ศ.ดร.สมชาย ใจดี&#10;ดร.วิไล รักษ์ดี"
                      value={committeeDraft}
                      onChange={(e) => setCommitteeDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={committeeSaving}
                      onClick={saveCommitteeOnly}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {committeeSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                      บันทึกรายชื่อกรรมการ
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                    <h4 className="text-sm font-bold text-gray-800">สถานะโครงการ</h4>
                    <p className="text-xs text-gray-500">เปลี่ยนได้ทันที (ไม่ต้องเปิดฟอร์มแก้ไขเต็ม)</p>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60"
                      disabled={statusSaving}
                      value={toEventStatusSelectValue(selectedActivity.status)}
                      onChange={(e) => void saveActivityStatusFromDetail(e.target.value)}
                      aria-label="เปลี่ยนสถานะกิจกรรม"
                    >
                      {eventStatusOptionsFor(selectedActivity.status).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {statusSaving ? (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> กำลังบันทึก...
                      </p>
                    ) : null}
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">จัดการด่วน</h4>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={openApplicants}
                        className="w-full flex justify-between items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm group cursor-pointer"
                      >
                        <span>ดูรายชื่อผู้สมัครทั้งหมด</span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                      </button>
                      <button
                        type="button"
                        disabled={remindLoading}
                        onClick={sendReminders}
                        className="w-full flex justify-between items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm group cursor-pointer disabled:opacity-60"
                      >
                        <span className="flex items-center gap-2">
                          {remindLoading ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Mail size={16} className="text-gray-400" />}
                          ส่งอีเมลแจ้งเตือนผู้สมัคร
                        </span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

      {applicantsOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[310] p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">รายชื่อผู้สมัคร</h3>
                <p className="text-sm text-gray-500">{selectedActivity.title}</p>
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
                      ยังไม่มีผู้สมัครผ่านทีมที่ลงทะเบียนในกิจกรรมนี้ — ผูกทีมกับกิจกรรมที่หน้าทีม/ระบบจัดการทีม
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
          </>,
          document.body
        )}

      {/* Modal แก้ไข */}
      {isEditModalOpen && editingActivity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[420] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">แก้ไขกิจกรรม</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingActivity.title} onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={toEventStatusSelectValue(editingActivity.status)} onChange={(e) => setEditingActivity({ ...editingActivity, status: e.target.value })}>
                    {eventStatusOptionsFor(editingActivity.status).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มโครงการ</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingActivity.date_input || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, date_input: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุดโครงการ</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingActivity.end_date_input || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, end_date_input: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด (แสดงในมุมมองกิจกรรม)</label>
                <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={editingActivity.description ?? ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คณะกรรมการตัดสิน (หนึ่งท่านต่อบรรทัด)</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={editingActivity.committee_members ?? ''}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, committee_members: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รับจำนวนผู้เข้าร่วม</label>
                  <input type="number" required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingActivity.max_participants} onChange={(e) => setEditingActivity({ ...editingActivity, max_participants: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingActivity.prize_pool} onChange={(e) => setEditingActivity({ ...editingActivity, prize_pool: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">ยืนยันการแก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal สร้างใหม่ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[420] backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างกิจกรรมใหม่</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม</label>
                <input type="text" required placeholder="เช่น โครงการ ELP..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={toEventStatusSelectValue(newActivity.status)} onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}>
                    {EVENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเริ่มโครงการ</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newActivity.date_text} onChange={(e) => setNewActivity({ ...newActivity, date_text: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุดโครงการ</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newActivity.end_date_input} onChange={(e) => setNewActivity({ ...newActivity, end_date_input: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                <textarea rows={3} placeholder="อธิบายโครงการสั้นๆ"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คณะกรรมการตัดสิน (หนึ่งท่านต่อบรรทัด — ทางเลือก)</label>
                <textarea
                  rows={3}
                  placeholder="เช่น ศ.ดร.สมชาย ใจดี"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  value={newActivity.committee_members}
                  onChange={(e) => setNewActivity({ ...newActivity, committee_members: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รับจำนวนผู้เข้าร่วม (คน)</label>
                  <input type="number" required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newActivity.max_participants} onChange={(e) => setNewActivity({ ...newActivity, max_participants: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label>
                  <input type="text" placeholder="เช่น 10,000 บาท" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newActivity.prize_pool} onChange={(e) => setNewActivity({ ...newActivity, prize_pool: e.target.value })} />
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เอกสารแนบโครงการ (ทางเลือก)</label>
                <div
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative group"
                  onDragEnter={handleActivityFileDragOver}
                  onDragOver={handleActivityFileDragOver}
                  onDrop={handleActivityFileDrop}
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700">
                        <span>คลิกเพื่ออัปโหลดไฟล์</span>
                        <input
                          ref={activityFileInputRef}
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => setNewActivity((prev) => ({ ...prev, fileName: e.target.files[0]?.name || '' }))}
                        />
                      </label>
                      <p className="pl-1">หรือลากไฟล์มาวาง</p>
                    </div>
                    <p className="text-xs text-gray-500">รองรับ PDF, DOCX, XLSX ขนาดไม่เกิน 10MB</p>
                    {newActivity.fileName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                        <File size={14} /> {newActivity.fileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all">สร้างกิจกรรม</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activities;