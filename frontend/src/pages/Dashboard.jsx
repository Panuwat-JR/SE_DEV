import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, ListTodo, FileText, Plus, 
  Clock, Trophy, CheckCircle2, CircleDashed, ChevronRight, X 
} from 'lucide-react';

function Dashboard() {      //step1: สร้างกล่องเปล่าวๆ ไว้เก็บข้อมูล
  const [data, setData] = useState({
    stats: {}, upcomingActivities: [], recentTasks: [], projectTimelines: [], activityLogs: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_money: ''
  });

  const fetchData = () => {   //step2: ฟังก์ชัน "วิ่งไปขอข้อมูล" จากหลังบ้าน
    fetch('http://localhost:5000/api/dashboard-data')
      .then(res => res.json())
      .then(dbData => setData(dbData))
      .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ:", err));
  };

  useEffect(() => { fetchData(); }, []); //step3:สั่งให้ดึงข้อมูล "ทันทีที่เปิดหน้าเว็บ"

  const handleSubmit = (e) => { //ส่วนบันทึกกิจกรรม
    e.preventDefault();
    fetch('http://localhost:5000/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
      setIsModalOpen(false);
      setFormData({ title: '', status: 'เปิดรับสมัคร', date_text: '', max_participants: 100, prize_money: '' });
      fetchData(); 
    })
    .catch(err => console.error("บันทึกไม่สำเร็จ:", err));
  };

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

      {/* ================= การ์ดสถิติ 4 ใบ ================= */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Calendar size={24} /></div><span className="bg-blue-400/50 px-2 py-1 rounded-full text-xs font-medium">+20%</span></div>
          <div className="text-sm font-medium text-blue-100 mb-1">กิจกรรมทั้งหมด</div>
          <div className="text-3xl font-bold mb-1">{data.upcomingActivities.length}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Users size={24} /></div><span className="bg-emerald-400/50 px-2 py-1 rounded-full text-xs font-medium">+15%</span></div>
          <div className="text-sm font-medium text-emerald-50 mb-1">ทีมที่ลงทะเบียน</div>
          <div className="text-3xl font-bold mb-1">{data.stats.registered_teams || 0}</div>
          <div className="text-xs text-emerald-100">จาก {data.stats.activities_with_teams || 0} กิจกรรม</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ListTodo size={24} /></div></div>
          <div className="text-sm font-medium text-gray-500 mb-1">งานที่ต้องทำ</div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{data.stats.total_tasks || 0}</div>
          <div className="text-xs text-gray-400">{data.stats.pending_tasks || 0} งานรอดำเนินการ</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4"><div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={24} /></div></div>
          <div className="text-sm font-medium text-gray-500 mb-1">เอกสารที่สร้าง</div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{data.stats.total_documents || 0}</div>
          <div className="text-xs text-gray-400">เดือนนี้ {data.stats.documents_this_month || 0} ฉบับ</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ================= กิจกรรมที่กำลังจะมาถึง ================= */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">กิจกรรมที่กำลังจะมาถึง</h2>
              <a href="#" className="flex items-center text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด <ChevronRight size={16} /></a>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {data.upcomingActivities.map(activity => (
                <div key={activity.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-1 w-3/4" title={activity.title}>{activity.title}</h3>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                        activity.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' :
                        activity.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{activity.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><Clock size={14} /> {activity.date_text}</div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Users size={12}/> ผู้เข้าร่วม</span>
                        <span>{activity.current_participants}/{activity.max_participants}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(activity.current_participants / activity.max_participants) * 100}%` }}></div></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-700 pt-3 border-t border-gray-50 mt-3">
                    <Trophy size={14} className={activity.prize_money !== 'ยังไม่ระบุ' ? "text-gray-400" : "text-gray-300"} /> {activity.prize_money !== 'ยังไม่ระบุ' ? `เงินรางวัล: ${activity.prize_money}` : 'ยังไม่ระบุ'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= งานล่าสุด ================= */}
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold text-gray-800">งานล่าสุด</h2><a href="#" className="flex items-center text-sm text-blue-600 font-medium hover:underline">ดูทั้งหมด <ChevronRight size={16} /></a></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              {data.recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">{task.title} <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'สูง' ? 'text-red-600 bg-red-50 border-red-100' : 'text-gray-600 bg-gray-100 border-gray-200'}`}>{task.priority}</span></div>
                    <div className="text-xs text-gray-500 mt-1">{task.project_name}</div>
                  </div>
                  <div className="flex items-center gap-4 w-48">
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className={task.progress_percent > 0 ? "bg-blue-600 h-2 rounded-full" : "bg-gray-200 h-2 rounded-full"} style={{ width: `${task.progress_percent}%` }}></div></div>
                    <span className={`text-xs font-bold w-8 px-2 py-1 rounded ${task.progress_percent > 0 ? "text-blue-600 bg-blue-50" : "text-amber-500 bg-amber-50"}`}>{task.progress_percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ================= ไทม์ไลน์ ================= */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">ไทม์ไลน์โครงการล่าสุด</h2>
            
            {/* ชุด UI แบบ Hardcode เพื่อให้แสดงผลตรงตามรูปเป๊ะๆ (ยังไม่ผูก DB) */}
            <div className="space-y-0">
              
              {/* Step 1: วางแผนโครงการ (เสร็จแล้ว - สีเขียว) */}
              <div className="relative flex items-start gap-4 pb-6">
                {/* เส้นเชื่อมลงมาสเต็ปถัดไป (สีเขียว) */}
                <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-emerald-500"></div>
                {/* ไอคอน */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shrink-0 mt-0.5 shadow-sm">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">วางแผนโครงการ</h3>
                  <p className="text-xs text-gray-500 mt-0.5">1 ม.ค. 2569</p>
                </div>
              </div>

              {/* Step 2: ขออนุมัติงบประมาณ (เสร็จแล้ว - สีเขียว) */}
              <div className="relative flex items-start gap-4 pb-6">
                <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-emerald-500"></div>
                <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shrink-0 mt-0.5 shadow-sm">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">ขออนุมัติงบประมาณ</h3>
                  <p className="text-xs text-gray-500 mt-0.5">15 ม.ค. 2569</p>
                </div>
              </div>

              {/* Step 3: เปิดรับสมัครผู้เข้าร่วม (ปัจจุบัน - สีน้ำเงิน) */}
              <div className="relative flex items-start gap-4 pb-6">
                {/* เส้นเชื่อมลงมาสเต็ปถัดไป (สีเทา เพราะยังไม่ถึง) */}
                <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gray-200"></div>
                <div className="relative z-10 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white shrink-0 mt-0.5 shadow-sm border border-blue-600">
                  <Clock size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-600">เปิดรับสมัครผู้เข้าร่วม</h3>
                  <p className="text-xs text-gray-500 mt-0.5">1 ก.พ. 2569</p>
                </div>
              </div>

              {/* Step 4: ดำเนินกิจกรรม (ยังไม่ถึง - สีเทาอ่อน) */}
              <div className="relative flex items-start gap-4 pb-6">
                <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gray-200"></div>
                {/* ไอคอนวงกลมเปล่าขอบเทา */}
                <div className="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center ring-4 ring-white shrink-0 mt-0.5 border-2 border-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ดำเนินกิจกรรม</h3>
                  <p className="text-xs text-gray-400 mt-0.5">15 ก.พ. 2569</p>
                </div>
              </div>

              {/* Step 5: สรุปผลโครงการ (ยังไม่ถึง - สีเทาอ่อน - ไม่มีเส้นต่อลงมา) */}
              <div className="relative flex items-start gap-4">
                <div className="relative z-10 w-6 h-6 rounded-full bg-white flex items-center justify-center ring-4 ring-white shrink-0 mt-0.5 border-2 border-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">สรุปผลโครงการ</h3>
                  <p className="text-xs text-gray-400 mt-0.5">28 ก.พ. 2569</p>
                </div>
              </div>

            </div>
          </div>

          {/* ================= กิจกรรมล่าสุด (Logs) ================= */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
            <div className="space-y-3">
              {data.activityLogs.map(log => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3">
                  <div className={`p-2 rounded-lg h-fit ${log.action_type === 'document' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {log.action_type === 'document' ? <FileText size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">{log.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{log.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">{log.user_name?.charAt(0) || 'U'}</span> {log.user_name} • {log.time_ago}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= Modal ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างกิจกรรมใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม <span className="text-red-500">*</span></label><input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น โครงการ Startup..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label><select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="เปิดรับสมัคร">เปิดรับสมัคร</option><option value="วางแผน">วางแผน</option><option value="กำลังดำเนินการ">กำลังดำเนินการ</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">วันที่จัดกิจกรรม</label><input type="date" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date_text} onChange={(e) => setFormData({...formData, date_text: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">รับจำนวนผู้เข้าร่วม (คน)</label><input type="number" required min="1" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.max_participants} onChange={(e) => setFormData({...formData, max_participants: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">เงินรางวัล</label><input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="เช่น 10,000 บาท หรือ ยังไม่ระบุ" value={formData.prize_money} onChange={(e) => setFormData({...formData, prize_money: e.target.value})} /></div>
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