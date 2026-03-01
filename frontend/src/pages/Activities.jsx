import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Clock, Trophy, Eye, X, Upload, File, Users, CalendarDays, MapPin, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Activities() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_pool: '', fileName: ''
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${title}" ?`)) {
      deleteEvent(id);
    }
  };

  const handleOpenEdit = (activity) => {
    setEditingActivity({ ...activity });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateEvent(editingActivity.id, editingActivity);
    setIsEditModalOpen(false);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    addEvent({
      title: newActivity.title,
      status: newActivity.status,
      date_text: newActivity.date_text,
      max_participants: Number(newActivity.max_participants),
      prize_pool: newActivity.prize_pool || 'ไม่มีเงินรางวัล',
    });
    setIsCreateModalOpen(false);
    setNewActivity({ title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_pool: '', fileName: '' });
  };

  const filteredActivities = events.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการกิจกรรม</h1>
          <p className="text-sm text-gray-500 mt-1">รายการกิจกรรมทั้งหมด ทั้งที่กำลังดำเนินการและที่ผ่านมาแล้ว</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
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
          <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter size={16} /> กรองสถานะ
          </button>
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
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${activity.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' :
                      activity.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700' :
                        activity.status === 'ดำเนินการสำเร็จ' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                      }`}>
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
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleOpenEdit(activity)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(activity.id, activity.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="ลบ">
                        <Trash2 size={16} />
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

      {/* Modal ดูรายละเอียดกิจกรรม */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header คล้ายแบนเนอร์ */}
            <div className="relative bg-gradient-to-br from-blue-700 to-indigo-900 px-8 py-10 shrink-0 overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="text-white space-y-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${selectedActivity.status === 'กำลังดำเนินการ' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30' :
                      selectedActivity.status === 'เปิดรับสมัคร' ? 'bg-blue-400/20 text-blue-100 border border-blue-400/30' :
                        selectedActivity.status === 'ดำเนินการสำเร็จ' ? 'bg-white/20 text-white border border-white/30' :
                          'bg-amber-400/20 text-amber-100 border border-amber-400/30'
                      }`}>
                      สถานะ: {selectedActivity.status}
                    </span>
                    <span className="text-sm font-medium text-blue-100 bg-black/20 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                      <CalendarDays size={14} /> {selectedActivity.date_text || 'ยังไม่ระบุวันที่'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-extrabold tracking-tight">{selectedActivity.title}</h2>
                  <p className="text-blue-100 text-lg max-w-2xl opacity-90 leading-relaxed">
                    การแข่งขันที่จะท้าทายความสามารถของคุณ พร้อมเปิดรับไอเดียใหม่ๆ เพื่อต่อยอดสู่ธุรกิจจริงในอนาคต (Mock Description)
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
                      <Clock size={20} className="text-blue-600" /> กำหนดการ (จำลอง)
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      {[
                        { date: '15 ตุลาคม 2026', title: 'เปิดรับสมัครทีม', desc: 'ลงทะเบียนผ่านระบบและส่ง Pitch Deck เบื้องต้น' },
                        { date: '30 ตุลาคม 2026', title: 'ประกาศผลรอบคัดเลือก', desc: 'ทีมที่ผ่านเข้ารอบจะได้รับแจ้งผ่านอีเมล' },
                        { date: '10 พฤศจิกายน 2026', title: 'วันแข่งขัน (Pitching Day)', desc: 'นำเสนอผลงานต่อหน้าคณะกรรมการ ณ อุทยานวิทยาศาสตร์' },
                      ].map((timeline, idx) => (
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

                  {/* Judges Mock */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      คณะกรรมการตัดสิน (Judges)
                    </h4>
                    <div className="space-y-3">
                      {[
                        { name: 'ดร. วิทยา ทรงพลัง', role: 'CEO, Tech Startup', img: 'ว' },
                        { name: 'คุณมาลี ใจดี', role: 'Angel Investor', img: 'ม' },
                        { name: 'ผศ.ดร. นักประดิษฐ์', role: 'อาจารย์มหาวิทยาลัย', img: 'น' },
                      ].map((judge, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm ring-2 ring-white shadow-sm">
                            {judge.img}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{judge.name}</p>
                            <p className="text-xs text-gray-500">{judge.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">จัดการด่วน</h4>
                    <div className="space-y-2">
                      <button className="w-full flex justify-between items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm group">
                        <span>ดูรายชื่อผู้สมัครทั้งหมด</span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                      </button>
                      <button className="w-full flex justify-between items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm group">
                        <span>ส่งอีเมลแจ้งเตือนผู้สมัคร</span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal แก้ไข */}
      {isEditModalOpen && editingActivity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
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
                    value={editingActivity.status} onChange={(e) => setEditingActivity({ ...editingActivity, status: e.target.value })}>
                    <option value="เปิดรับสมัคร">เปิดรับสมัคร</option>
                    <option value="วางแผน">วางแผน</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="ดำเนินการสำเร็จ">ดำเนินการสำเร็จ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดกิจกรรม</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editingActivity.date_text} onChange={(e) => setEditingActivity({ ...editingActivity, date_text: e.target.value })} />
                </div>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
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
                    value={newActivity.status} onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}>
                    <option value="เปิดรับสมัคร">เปิดรับสมัคร</option>
                    <option value="วางแผน">วางแผน</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="ดำเนินการสำเร็จ">ดำเนินการสำเร็จ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดกิจกรรม</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newActivity.date_text} onChange={(e) => setNewActivity({ ...newActivity, date_text: e.target.value })} />
                </div>
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative group">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700">
                        <span>คลิกเพื่ออัปโหลดไฟล์</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only"
                          onChange={(e) => setNewActivity({ ...newActivity, fileName: e.target.files[0]?.name })} />
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