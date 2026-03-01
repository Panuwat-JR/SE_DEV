// pages/participant/P_Calendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const EVENTS = [
    { date: '2026-03-15', title: 'ส่ง Business Plan', project: 'Startup Thailand', color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-50' },
    { date: '2026-03-20', title: 'Pitching Day รอบแรก', project: 'Startup Thailand', color: 'bg-purple-500', textColor: 'text-purple-700', bg: 'bg-purple-50' },
    { date: '2026-03-22', title: 'สรุปผลการแข่งขัน', project: 'Startup Thailand', color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
    { date: '2026-03-30', title: 'ยืนยันการสมัคร ELP', project: 'ELP Batch 5', color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50' },
    { date: '2026-04-05', title: 'ELP Orientation Day', project: 'ELP Batch 5', color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50' },
];

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function P_Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return EVENTS.filter(e => e.date === dateStr);
    };

    const upcoming = [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">ปฏิทินกิจกรรม</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    {/* Nav */}
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={20} /></button>
                        <h2 className="font-bold text-gray-900">{MONTHS_TH[month]} {year + 543}</h2>
                        <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"><ChevronRight size={20} /></button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_TH.map(d => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const evs = getEventsForDay(day);
                            const isToday = day === 1 && month === 2 && year === 2026;
                            return (
                                <div key={day} className={`min-h-[64px] p-1 rounded-xl border ${isToday ? 'border-emerald-300 bg-emerald-50' : 'border-transparent hover:bg-gray-50'} transition-colors`}>
                                    <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}>{day}</div>
                                    <div className="space-y-0.5">
                                        {evs.map((ev, idx) => (
                                            <div key={idx} className={`${ev.color} text-white text-[8px] rounded px-1 py-0.5 font-bold truncate leading-tight`}>
                                                {ev.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming events */}
                <div className="space-y-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2"><CalIcon size={18} className="text-emerald-600" /> กำหนดการที่ใกล้มา</h2>
                    <div className="space-y-3">
                        {upcoming.map((ev, idx) => {
                            const d = new Date(ev.date);
                            return (
                                <div key={idx} className={`p-4 rounded-2xl border ${ev.bg} border-opacity-50`}>
                                    <div className={`text-[10px] font-bold ${ev.textColor} mb-1 uppercase`}>{ev.project}</div>
                                    <div className="font-bold text-gray-900 text-sm">{ev.title}</div>
                                    <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                                        <CalIcon size={12} />
                                        {d.getDate()} {MONTHS_TH[d.getMonth()]} {d.getFullYear() + 543}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
