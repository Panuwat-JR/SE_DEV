import React from 'react';
import { ArrowLeft, Clock, Calendar, User, Tag, CheckCircle2, Paperclip, MessageSquare } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const TaskDetail = () => {
  const { id } = useParams();

  // Mock Data
  const task = {
    title: "เบิกค่าใช้จ่าย",
    project: "new gen",
    status: "รอดำเนินการ",
    priority: "สูง",
    progress: 0,
    dueDate: "25 ก.ย. 2569",
    assignee: "สมชาย ใจดี",
    description: "รวบรวมใบเสร็จค่าเดินทางและค่าที่พักสำหรับการจัดกิจกรรม new gen เพื่อทำเรื่องเบิกจ่ายกับทางฝ่ายการเงิน",
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium">
          <ArrowLeft size={16} />
          กลับไปหน้ากระดานงาน
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-bold">TASK-{id || '1'}</span>
              โครงการ: <span className="text-blue-600 font-medium">{task.project}</span>
            </p>
          </div>
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-bold shadow-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            ทำเครื่องหมายว่าเสร็จสิ้น
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ฝั่งซ้าย (รายละเอียด) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดงาน</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[120px]">
              {task.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-900">ความคิดเห็น</h3>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">ส</div>
              <div className="flex-1">
                <textarea 
                  placeholder="พิมพ์ความคิดเห็น หรืออัปเดตความคืบหน้า..." 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold">ส่งความคิดเห็น</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา (สถานะและข้อมูล) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <span className="text-xs text-gray-400 block mb-1">สถานะ</span>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                {task.status}
              </span>
            </div>
            
            <div>
              <span className="text-xs text-gray-400 block mb-1">ความสำคัญ</span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-red-500">
                <Tag size={14} /> {task.priority}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">ผู้รับผิดชอบ</span>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold">ส</div>
                {task.assignee}
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-400 block mb-1">กำหนดส่ง</span>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Calendar size={16} className="text-gray-400" />
                {task.dueDate}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                <span>ความคืบหน้า</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${task.progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Paperclip size={18} className="text-gray-400" />
              ไฟล์แนบ
            </h3>
            <button className="w-full py-3 border border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors">
              + อัปโหลดไฟล์ที่เกี่ยวข้อง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;