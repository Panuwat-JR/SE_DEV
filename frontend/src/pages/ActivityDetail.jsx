import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy, Users, CheckSquare, Settings, X } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, tasks, updateEvent, deleteEvent } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const activity = events.find(e => String(e.id) === String(id));

  if (!activity) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลกิจกรรม</p>
        <Link to="/activities" className="text-blue-600 hover:underline">← กลับไปหน้ารายการ</Link>
      </div>
    );
  }

  const relatedTasks = tasks.filter(t => String(t.event_id) === String(id));
  const [editData, setEditData] = useState({ ...activity });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateEvent(activity.id, editData);
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`ลบกิจกรรม "${activity.title}" ?`)) {
      deleteEvent(activity.id);
      navigate('/activities');
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="mb-6">
        <Link to="/activities" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> กลับไปหน้ารายการกิจกรรม
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activity.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  activity.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    activity.status === 'ดำเนินการสำเร็จ' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                }`}>{activity.status}</span>
            </div>
            {activity.location && <p className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> {activity.location}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setEditData({ ...activity }); setIsEditOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
              <Settings size={18} /> จัดการกิจกรรม
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium border border-red-200">
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
                  <div className={`w-3 h-3 rounded-full ${item.color} shrink-0`}></div>
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
                <span className="text-sm font-bold text-gray-900">{activity.current_participants}/{activity.max_participants}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-gray-400" /> งานที่เกี่ยวข้อง ({relatedTasks.length})
              </span>
              <div className="space-y-2">
                {relatedTasks.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีงานที่เกี่ยวข้อง</p>}
                {relatedTasks.map(task => (
                  <Link to={`/tasks/${task.id}`} key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                    <span className="text-gray-700 font-medium">{task.task_name || task.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${task.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                        task.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                      }`}>{task.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">แก้ไขกิจกรรม</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                    <option value="เปิดรับสมัคร">เปิดรับสมัคร</option>
                    <option value="วางแผน">วางแผน</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="ดำเนินการสำเร็จ">ดำเนินการสำเร็จ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={editData.prize_pool} onChange={(e) => setEditData({ ...editData, prize_pool: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetail;