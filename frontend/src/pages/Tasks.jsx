import React, { useState } from 'react';
import { Search, Plus, Filter, Clock, AlertCircle, CheckCircle2, Calendar, X, Upload, File } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Tasks() {
  const { tasks, events, addTask } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    task_name: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: '', fileName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({ ...formData });
    setIsModalOpen(false);
    setFormData({ task_name: '', event_id: '', status: 'รอดำเนินการ', priority: 'ปกติ', category: 'ทั่วไป', due_date: '', fileName: '' });
  };

  const getStatusIcon = (status) => {
    if (status === 'รอดำเนินการ') return <Clock size={16} className="text-gray-400 mt-0.5" />;
    if (status === 'กำลังดำเนินการ') return <AlertCircle size={16} className="text-emerald-500 mt-0.5" />;
    return <CheckCircle2 size={16} className="text-green-500 mt-0.5" />;
  };

  const columns = ['รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น'];
  const colors = ['bg-amber-400', 'bg-emerald-500', 'bg-green-500'];

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">งาน</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการและติดตามงานทั้งหมดในแต่ละกิจกรรม</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
          <Plus size={18} /> สร้างงานใหม่
        </button>
      </div>

      {/* กระดาน Kanban */}
      <div className="grid grid-cols-3 gap-6 flex-1 items-start">
        {columns.map((statusType, index) => (
          <div key={statusType} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${colors[index]}`}></div>
              <h2 className="font-bold text-gray-800">{statusType}</h2>
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === statusType).length}
              </span>
            </div>
            {tasks.filter(t => t.status === statusType).map(task => (
              <TaskCard key={task.id} task={task} getStatusIcon={getStatusIcon} onClick={() => setSelectedTask(task)} />
            ))}
          </div>
        ))}
      </div>

      {/* Modal ดูรายละเอียดงาน */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedTask.task_name || selectedTask.title}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  กิจกรรม: <span className="font-semibold text-gray-700">{selectedTask.event || '-'}</span>
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Column (Main Content) */}
              <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-100">
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <File size={18} className="text-blue-500" /> รายละเอียดงาน
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed border border-gray-100">
                    <p>จำลองคำอธิบายของงานนี้: นี่คือรายละเอียดของงานที่คุณต้องทำให้เสร็จสิ้นเพื่อบรรลุเป้าหมายของกิจกรรม การมีรายละเอียดที่ชัดเจนจะช่วยให้ทีมของคุณมีทิศทางในการทำงานร่วมกัน</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>ประสานงานกับผู้ที่เกี่ยวข้องเพื่อรวบรวมข้อมูล</li>
                      <li>ตรวจสอบความถูกต้องก่อนเริ่มดำเนินการจริง</li>
                    </ul>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-500" /> สิ่งที่ต้องทำ (Subtasks)
                    </h3>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">{selectedTask.progress === 100 ? 'เสร็จสิ้นครบถ้วน' : 'กำลังดำเนินการ'}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 1, text: 'ศึกษาความต้องการเบื้องต้นจากหัวหน้างาน', done: selectedTask.progress > 0 },
                      { id: 2, text: 'ประชุมชี้แจงทีมงานที่รับผิดชอบและแบ่งงาน', done: selectedTask.progress >= 50 },
                      { id: 3, text: 'ลงมือปฏิบัติตามแผนและสรุปผลรายวัน', done: selectedTask.progress === 100 },
                    ].map(st => (
                      <div key={st.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group cursor-pointer">
                        <input type="checkbox" defaultChecked={st.done} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className={`text-sm ${st.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{st.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Upload size={18} className="text-amber-500" /> ไฟล์แนบ
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer group transition-all">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                        <File size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-700 truncate pr-4">รายละเอียดเบื้องต้น.pdf</p>
                        <p className="text-xs text-gray-400">1.2 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer group transition-all">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                        <File size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-700 truncate pr-4">ข้อมูลสรุปจากที่ประชุม.xlsx</p>
                        <p className="text-xs text-gray-400">345 KB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Metadata) */}
              <div className="w-1/3 p-6 bg-gray-50/50 overflow-y-auto">
                <div className="space-y-6">
                  {/* Status Box */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">สถานะการส่งงาน</p>
                    <div className="flex justify-center items-center py-1.5 rounded-lg border bg-white shadow-sm overflow-hidden text-sm">
                      <span className={`w-full text-center font-bold px-3 py-1.5 ${selectedTask.status === 'รอดำเนินการ' ? 'text-amber-700 bg-amber-50' :
                        selectedTask.status === 'กำลังดำเนินการ' ? 'text-emerald-700 bg-emerald-50' : 'text-green-700 bg-green-50'
                        }`}>
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>

                  {/* Settings Box */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center group cursor-pointer hover:bg-gray-50">
                      <p className="text-xs text-gray-500">ความสำคัญ</p>
                      <span className={`text-sm font-bold flex items-center gap-1.5 ${selectedTask.priority === 'สูง' ? 'text-red-600' : 'text-gray-700'}`}>
                        <span className={`w-2 h-2 inline-block rounded-full ${selectedTask.priority === 'สูง' ? 'bg-red-500' : selectedTask.priority === 'กลาง' ? 'bg-amber-500' : 'bg-blue-400'}`}></span>
                        {selectedTask.priority || 'ปกติ'}
                      </span>
                    </div>
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center group cursor-pointer hover:bg-gray-50">
                      <p className="text-xs text-gray-500">หมวดหมู่</p>
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{selectedTask.category || 'ทั่วไป'}</span>
                    </div>
                    <div className="p-4 flex justify-between items-center group cursor-pointer hover:bg-gray-50">
                      <p className="text-xs text-gray-500">วันที่ครบกำหนด</p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-800 font-semibold group-hover:text-blue-600 transition-colors">
                        <Calendar size={14} className="text-blue-500" /> {selectedTask.date || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Box */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ความคืบหน้า</p>
                      <span className="text-sm font-bold text-blue-600">{selectedTask.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${selectedTask.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${selectedTask.progress || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Assignees Box */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">ทีมงาน (ผู้รับผิดชอบ)</p>
                    <div className="flex flex-col gap-2">
                      {selectedTask.assignees && selectedTask.assignees.length > 0 ? selectedTask.assignees.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-white border border-transparent hover:border-blue-200 rounded-xl group transition-all cursor-pointer shadow-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">{name.charAt(0)}</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">{name} (จำลอง)</span>
                            <span className="text-[10px] text-gray-400">เจ้าหน้าที่ประสานงาน</span>
                          </div>
                        </div>
                      )) : <span className="text-sm text-gray-500">ยังไม่มีผู้รับผิดชอบ</span>}
                      <button className="flex items-center gap-2 justify-center w-full mt-2 p-2 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <Plus size={16} /> <span className="text-sm font-semibold">เพิ่มสมาชิก</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-white shrink-0">
              <button onClick={() => setSelectedTask(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">ย้อนกลับ / ยกเลิก</button>
              <button onClick={() => setSelectedTask(null)} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                <CheckCircle2 size={18} /> บันทึกความคืบหน้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal สร้างงาน */}
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
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="เช่น สั่งซื้ออุปกรณ์..."
                  value={formData.task_name} onChange={(e) => setFormData({ ...formData, task_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จัดอยู่ในกิจกรรม</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  value={formData.event_id} onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}>
                  <option value="">-- ไม่ระบุกิจกรรม --</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ความสำคัญ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="สูง">สูง</option>
                    <option value="กลาง">กลาง</option>
                    <option value="ปกติ">ปกติ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
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
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เอกสารแนบ (ทางเลือก)</label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative group bg-gray-50/30">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="task-file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700">
                        <span>คลิกเพื่ออัปโหลดไฟล์</span>
                        <input id="task-file-upload" name="task-file-upload" type="file" className="sr-only"
                          onChange={(e) => setFormData({ ...formData, fileName: e.target.files[0]?.name })} />
                      </label>
                      <p className="pl-1">หรือลากไฟล์มาวาง</p>
                    </div>
                    <p className="text-xs text-gray-500">รองรับ PDF, DOCX, XLSX ขนาดไม่เกิน 10MB</p>
                    {formData.fileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                        <File size={14} /> {formData.fileName}
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
}

function TaskCard({ task, getStatusIcon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group relative cursor-pointer"
    >
      <div className="flex items-start gap-2 mb-1">
        {getStatusIcon(task.status)}
        <h3 className="font-semibold text-sm text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{task.task_name || task.title}</h3>
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
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${task.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-700' :
            task.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'
            }`}>{task.status}</span>
          <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${task.priority === 'สูง' ? 'text-red-600' : 'text-gray-500'}`}>{task.priority}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} /> {task.date}
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <span className="text-[10px] font-semibold text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">{task.category}</span>
        <div className="flex -space-x-1">
          {task.assignees?.map((name, idx) => (
            <div key={idx} className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">{name}</div>
          ))}
        </div>
      </div>
      <div className="absolute top-4 right-4 text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-blue-50 px-2 py-1 rounded-md">ดูรายละเอียด &rarr;</div>
    </div>
  );
}

export default Tasks;