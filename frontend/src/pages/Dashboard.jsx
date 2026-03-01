import React, { useState } from 'react';
import {
  Calendar, Users, ListTodo, FileText, Plus,
  Clock, Trophy, CheckCircle2, ChevronRight, X, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const { stats, events, tasks: allTasks, logs, addEvent } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_pool: ''
  });

  // ไทม์ไลน์ (คง mock ไว้เหมือนเดิม)
  const [selectedTimeline, setSelectedTimeline] = useState('project_1');
  const timelineData = {
    project_1: {
      name: 'Startup Thailand League 2569',
      steps: [
        { id: 1, title: 'วางแผนโครงการ', date: '1 ม.ค. 2569', status: 'completed' },
        { id: 2, title: 'ขออนุมัติงบประมาณ', date: '15 ม.ค. 2569', status: 'completed' },
        { id: 3, title: 'เปิดรับสมัครผู้เข้าร่วม', date: '1 ก.พ. 2569', status: 'current' },
        { id: 4, title: 'ดำเนินกิจกรรม', date: '15 มิ.ย. 2569', status: 'upcoming' },
        { id: 5, title: 'สรุปผลโครงการ', date: '30 มิ.ย. 2569', status: 'upcoming' },
      ]
    },
    project_2: {
      name: 'โครงการพัฒนาผู้ประกอบการ',
      steps: [
        { id: 1, title: 'ประชุมทีมผู้จัดงาน', date: '10 ก.พ. 2569', status: 'completed' },
        { id: 2, title: 'ติดต่อวิทยากร', date: '18 ก.พ. 2569', status: 'current' },
        { id: 3, title: 'เปิดรับสมัคร', date: '1 มี.ค. 2569', status: 'upcoming' },
        { id: 4, title: 'วันจัดกิจกรรมจริง', date: '20 เม.ย. 2569', status: 'upcoming' },
      ]
    }
  };
  const currentTimeline = timelineData[selectedTimeline];

  const handleSubmit = (e) => {
    e.preventDefault();
    addEvent({
      ...formData,
      max_participants: Number(formData.max_participants),
    });
    setIsModalOpen(false);
    setFormData({ title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_pool: '' });
  };

  const upcomingActivities = events.slice(0, 3);
  const recentTasks = allTasks.slice(0, 3);

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
          <p className="text-sm text-gray-500 mt-1">ภาพรวมกิจกรรมและงานล่าสุดของ NU SEED</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
          <Plus size={18} /> สร้างกิจกรรมใหม่
        </button>
      </div>

      {/* การ์ดสถิติ 4 ใบ */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Calendar size={24} /></div><span className="bg-blue-400/50 px-2 py-1 rounded-full text-xs font-medium">ทั้งหมด</span></div>
          <div className="text-sm font-medium text-blue-100 mb-1">กิจกรรมทั้งหมด</div>
          <div className="text-3xl font-bold mb-1">{stats.total_activities}</div>
          <div className="text-xs text-blue-100">{stats.active_activities} กำลังดำเนินการ</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Users size={24} /></div><span className="bg-emerald-400/50 px-2 py-1 rounded-full text-xs font-medium">ทีม</span></div>
          <div className="text-sm font-medium text-emerald-50 mb-1">ทีมที่ลงทะเบียน</div>
          <div className="text-3xl font-bold mb-1">{stats.registered_teams}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ListTodo size={24} /></div></div>
          <div className="text-sm font-medium text-gray-500 mb-1">งานที่ต้องทำ</div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total_tasks}</div>
          <div className="text-xs text-gray-400">{stats.pending_tasks} งานรอดำเนินการ</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div></div>
          <div className="text-sm font-medium text-gray-500 mb-1">เอกสารที่สร้าง</div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total_documents}</div>
          <div className="text-xs text-gray-400">เดือนนี้ {stats.documents_this_month} ฉบับ</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* กิจกรรมที่กำลังจะมาถึง */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">กิจกรรมที่กำลังจะมาถึง</h2>
              <Link to="/activities" className="flex items-center text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด <ChevronRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {upcomingActivities.map(activity => (
                <Link to={`/activities/${activity.id}`} key={activity.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-1 w-3/4">{activity.title}</h3>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${activity.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' :
                          activity.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700' :
                            activity.status === 'ดำเนินการสำเร็จ' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'
                        }`}>{activity.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><Clock size={14} /> {activity.date_text}</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Users size={12} /> ผู้เข้าร่วม</span>
                        <span>{activity.current_participants}/{activity.max_participants}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min((activity.current_participants / activity.max_participants) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-700 pt-3 border-t border-gray-50 mt-3">
                    <Trophy size={14} className="text-gray-400" /> {activity.prize_pool || 'ยังไม่ระบุ'}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* งานล่าสุด */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">งานล่าสุด</h2>
              <Link to="/tasks" className="flex items-center text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด <ChevronRight size={16} /></Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              {recentTasks.map(task => (
                <Link to={`/tasks/${task.id}`} key={task.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-xl transition-colors">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      {task.task_name || task.title}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'สูง' ? 'text-red-600 bg-red-50 border-red-100' : 'text-gray-600 bg-gray-100 border-gray-200'}`}>{task.priority}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{task.event}</div>
                  </div>
                  <div className="flex items-center gap-4 w-48">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={task.progress > 0 ? 'bg-blue-600 h-2 rounded-full' : 'bg-gray-200 h-2 rounded-full'} style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold w-8 px-2 py-1 rounded ${task.progress > 0 ? 'text-blue-600 bg-blue-50' : 'text-amber-500 bg-amber-50'}`}>{task.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ไทม์ไลน์โครงการ */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">ไทม์ไลน์โครงการ</h2>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                >
                  {Object.entries(timelineData).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div className="relative pl-3 space-y-6 mt-2">
              <div className="absolute left-[19px] top-2 bottom-6 w-[2px] bg-gray-100"></div>
              {currentTimeline.steps.map((step, index) => {
                const nextStep = currentTimeline.steps[index + 1];
                const showGreenLine = step.status === 'completed' && nextStep && (nextStep.status === 'completed' || nextStep.status === 'current');
                const isLast = index === currentTimeline.steps.length - 1;
                return (
                  <div key={step.id} className="relative flex gap-4 items-start">
                    {showGreenLine && <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-emerald-500 z-0"></div>}
                    <div className="relative z-10 bg-white pt-1">
                      {step.status === 'completed' ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm"><CheckCircle2 size={16} className="fill-emerald-500 text-white" /></div>
                      ) : step.status === 'current' ? (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center ring-4 ring-white shadow-sm shadow-blue-600/30"><Clock size={12} className="text-white" /></div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center ring-4 ring-white"><div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div></div>
                      )}
                    </div>
                    <div className={`flex flex-col pt-0.5 ${!isLast ? 'pb-2' : ''}`}>
                      <span className={`text-sm font-bold ${step.status === 'completed' ? 'text-gray-800' : step.status === 'current' ? 'text-blue-600' : 'text-gray-400'}`}>{step.title}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5">{step.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* กิจกรรมล่าสุด (Logs) */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${log.action_type === 'document' ? 'bg-blue-50 text-blue-600' : log.action_type === 'task' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {log.action_type === 'document' ? <FileText size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{log.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{log.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">{log.user_name?.charAt(0) || 'U'}</span>
                      {log.user_name} • {log.time_ago}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal สร้างกิจกรรม */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างกิจกรรมใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น โครงการ Startup..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="เปิดรับสมัคร">เปิดรับสมัคร</option>
                    <option value="วางแผน">วางแผน</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดกิจกรรม</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date_text} onChange={(e) => setFormData({ ...formData, date_text: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รับจำนวนผู้เข้าร่วม (คน)</label>
                  <input type="number" required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น 10,000 บาท" value={formData.prize_pool} onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20">บันทึกกิจกรรม</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;