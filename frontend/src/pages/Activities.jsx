import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Clock, Trophy, Eye, X, Upload, File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Activities() {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
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
                    <Link to={`/activities/${activity.id}`} className="hover:text-blue-600 transition-colors">
                      {activity.title}
                    </Link>
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
                      <Link to={`/activities/${activity.id}`} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="ดูรายละเอียด">
                        <Eye size={16} />
                      </Link>
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