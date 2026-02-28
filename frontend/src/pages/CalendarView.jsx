import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Filter } from 'lucide-react';

const CalendarView = () => {
  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  
  // สมมติว่าเป็นเดือน กุมภาพันธ์ 2569 (2026) ที่เริ่มต้นวันอาทิตย์พอดี และมี 28 วัน
  const daysInMonth = 28; 
  
  // ข้อมูลจำลองสำหรับแสดงในปฏิทิน
  const events = [
    { date: 5, title: 'ส่งเอกสารเบิกงบ', type: 'task', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { date: 15, title: 'ประชุมทีม Alpha', type: 'meeting', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { date: 20, title: 'Orientation วันปฐมนิเทศ', type: 'activity', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { date: 25, title: 'เปิดรับสมัคร ELP', type: 'activity', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { date: 26, title: 'กิจกรรมแข่งชิงเงิน', type: 'activity', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { date: 27, title: 'กิจกรรมแข่งนอน', type: 'activity', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ];

  // ฟังก์ชันหา Event ของแต่ละวัน
  const getEventsForDay = (day) => {
    return events.filter(e => e.date === day);
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon size={28} className="text-blue-600" />
            ปฏิทินโครงการ
          </h1>
          <p className="text-gray-500 text-sm mt-1">ภาพรวมกิจกรรมและกำหนดการงานทั้งหมด</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Filter size={18} /> ตัวกรอง
          </button>
          <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
            <Plus size={18} /> สร้างกำหนดการ
          </button>
        </div>
      </div>

      {/* Calendar Controller */}
      <div className="bg-white rounded-t-2xl border border-gray-100 border-b-0 p-4 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 ml-2">กุมภาพันธ์ 2569</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors">
            วันนี้
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-100 rounded-b-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="py-3 text-center text-xs font-bold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {Array.from({ length: 35 }).map((_, index) => {
            const dayNum = index + 1;
            const isCurrentMonth = dayNum <= daysInMonth;
            const displayDay = isCurrentMonth ? dayNum : dayNum - daysInMonth;
            const dayEvents = isCurrentMonth ? getEventsForDay(displayDay) : [];

            return (
              <div 
                key={index} 
                className={`min-h-[120px] border-b border-r border-gray-100 p-2 transition-colors ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50/30'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${displayDay === 26 && isCurrentMonth ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                    {displayDay}
                  </span>
                </div>
                
                {/* Event Pills */}
                <div className="space-y-1.5 mt-2">
                  {dayEvents.map((evt, i) => (
                    <div 
                      key={i} 
                      className={`text-[11px] font-bold px-2 py-1.5 rounded-md border truncate cursor-pointer hover:opacity-80 transition-opacity ${evt.color}`}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;