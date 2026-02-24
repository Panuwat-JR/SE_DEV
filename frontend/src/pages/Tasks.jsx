import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Clock, AlertCircle, CheckCircle2, Calendar, X } from 'lucide-react';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // ข้อมูลฟอร์มสำหรับสร้างงานใหม่
  const [formData, setFormData] = useState({
    title: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: ''
  });

  // 1. ดึงข้อมูลงานมาใส่กระดาน
  const fetchTasks = () => {
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTasks(data); })
      .catch(err => console.error("ดึงข้อมูลงานไม่สำเร็จ:", err));
  };

  // 2. ดึงรายชื่อกิจกรรมมาใส่ Dropdown
  const fetchEvents = () => {
    fetch('http://localhost:5000/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("ดึงข้อมูลกิจกรรมไม่สำเร็จ:", err));
  };

  useEffect(() => {
    fetchTasks();
    fetchEvents();
  }, []);

  // 3. ฟังก์ชันกดปุ่มบันทึกงาน
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      setIsModalOpen(false); // ปิดหน้าต่าง
      setFormData({ title: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: '' }); // ล้างข้อมูล
      fetchTasks(); // โหลดกระดานใหม่ทันที!
    })
    .catch(err => console.error("บันทึกไม่สำเร็จ:", err));
  };

  const getStatusIcon = (status) => {
    if (status === 'รอดำเนินการ') return <Clock size={16} className="text-gray-400 mt-0.5" />;
    if (status === 'กำลังดำเนินการ') return <AlertCircle size={16} className="text-emerald-500 mt-0.5" />;
    return <CheckCircle2 size={16} className="text-green-500 mt-0.5" />;
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">งาน</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการและติดตามงานทั้งหมดในแต่ละกิจกรรม</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // กดแล้วเปิด Modal
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus size={18} /> สร้างงานใหม่
        </button>
      </div>

      {/* ================= ส่วนกระดาน Kanban (เหมือนเดิม) ================= */}
      <div className="grid grid-cols-3 gap-6 flex-1 items-start">
        {['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'].map((statusType, index) => {
          const colors = ['bg-amber-400', 'bg-emerald-500', 'bg-green-500'];
          return (
            <div key={statusType} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${colors[index]}`}></div>
                <h2 className="font-bold text-gray-800">{statusType}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === statusType).length}</span>
              </div>
              {tasks.filter(t => t.status === statusType).map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          );
        })}
      </div>

      {/* ================= หน้าต่าง Modal สร้างงานใหม่ ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[600px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างงานใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่องาน <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="เช่น สั่งซื้ออุปกรณ์..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จัดอยู่ในกิจกรรม</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" value={formData.event_id} onChange={(e) => setFormData({...formData, event_id: e.target.value})}>
                  <option value="">-- ไม่ระบุกิจกรรม --</option>
                  {events.map(ev => (
                    <option key={ev.event_id} value={ev.event_id}>{ev.event_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="กำลังทำ">กำลังทำ</option>
                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="สูง">สูง</option>
                    <option value="กลาง">กลาง</option>
                    <option value="ปกติ">ปกติ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="ทั่วไป">ทั่วไป</option>
                    <option value="ประสานงาน">ประสานงาน</option>
                    <option value="สถานที่">สถานที่</option>
                    <option value="เอกสาร">เอกสาร</option>
                    <option value="การตลาด">การตลาด</option>
                    <option value="โลจิสติกส์">โลจิสติกส์</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ครบกำหนด</label>
                  <input type="date" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20">บันทึกงาน</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Component วาดการ์ด (เหมือนเดิม)
  function TaskCard({ task }) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-2 mb-1">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-sm text-gray-800 leading-tight">{task.title}</h3>
        </div>
        <p className="text-xs text-gray-500 ml-6 mb-4 line-clamp-1">{task.event}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>ความคืบหน้า</span>
            <span className="font-medium text-gray-700">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${task.progress}%` }}></div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              task.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-700' : 
              task.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'
            }`}>{task.status}</span>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${
              task.priority === 'สูง' ? 'text-red-600' : 'text-gray-500'
            }`}>{task.priority}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={12} /> {task.date}
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <span className="text-[10px] font-semibold text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
            {task.category}
          </span>
          <div className="flex -space-x-1">
            {task.assignees?.map((name, idx) => (
              <div key={idx} className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Tasks;