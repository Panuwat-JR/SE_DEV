import React, { useState, useEffect } from 'react';
// 1. นำเข้า Upload และ File เพิ่มเติม
import { Search, Plus, Filter, Clock, AlertCircle, CheckCircle2, Calendar, X, Upload, File } from 'lucide-react';
import { Link } from 'react-router-dom';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // 2. เพิ่ม fileName: '' ในข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    title: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: '', fileName: ''
  });

  const fetchTasks = () => {
    fetch('http://localhost:5000/api/tasks')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTasks(data); })
      .catch(err => console.error("ดึงข้อมูลงานไม่สำเร็จ:", err));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      setIsModalOpen(false); 
      // 3. ล้างค่า fileName ตอนกดบันทึกด้วย
      setFormData({ title: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: '', fileName: '' }); 
      fetchTasks(); 
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
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus size={18} /> สร้างงานใหม่
        </button>
      </div>

      {/* ================= ส่วนกระดาน Kanban ================= */}
      <div className="grid grid-cols-3 gap-6 flex-1 items-start">
        {['รอดำเนินการ', 'กำลังทำ', 'เสร็จสิ้น'].map((statusType, index) => {
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

              {/* 4. กล่องแนบเอกสาร */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เอกสารแนบ (ทางเลือก)</label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative group bg-gray-50/30">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="task-file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700">
                        <span>คลิกเพื่ออัปโหลดไฟล์</span>
                        <input 
                          id="task-file-upload" 
                          name="task-file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={(e) => setFormData({...formData, fileName: e.target.files[0]?.name})}
                        />
                      </label>
                      <p className="pl-1">หรือลากไฟล์มาวาง</p>
                    </div>
                    <p className="text-xs text-gray-500">รองรับ PDF, DOCX, XLSX ขนาดไม่เกิน 10MB</p>
                    
                    {/* แสดงชื่อไฟล์เมื่อมีการเลือกไฟล์แล้ว */}
                    {formData.fileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                        <File size={14} /> 
                        {formData.fileName}
                      </div>
                    )}
                  </div>
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

  function TaskCard({ task }) {
    return (
      <Link 
        to={`/tasks/${task.id}`}
        className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group relative cursor-pointer"
      >
        <div className="flex items-start gap-2 mb-1">
          {getStatusIcon(task.status)}
          <h3 className="font-semibold text-sm text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{task.title}</h3>
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
        
        <div className="absolute top-4 right-4 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-blue-50 px-2 py-1 rounded-md">
          ดูรายละเอียด &rarr;
        </div>
      </Link>
    );
  }
}

export default Tasks;