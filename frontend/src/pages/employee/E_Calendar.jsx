// pages/employee/E_Calendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Filter } from 'lucide-react';

const PROJECT_COLORS = {
    'Startup Thailand League': { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
    'ELP Batch 5': { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
    'Innovation Challenge': { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', bar: 'bg-gray-400' },
    'NU Hackathon': { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
    'NU Startup Demo Day': { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
};

const INIT_EVENTS = [
    { id: 1, date: '2026-03-05', title: 'ประชุมทีม ELP', project: 'ELP Batch 5', time: '09:00', type: 'ประชุม' },
    { id: 2, date: '2026-03-10', title: 'กำหนดส่ง Business Plan', project: 'Startup Thailand League', time: 'สิ้นวัน', type: 'กำหนดส่ง' },
    { id: 3, date: '2026-03-15', title: 'ส่ง Business Plan รอบสุดท้าย', project: 'Startup Thailand League', time: '17:00', type: 'กำหนดส่ง' },
    { id: 4, date: '2026-03-20', title: 'Pitching Day รอบแรก', project: 'Startup Thailand League', time: '08:00', type: 'กิจกรรม' },
    { id: 5, date: '2026-03-22', title: 'ประกาศผล Startup League', project: 'Startup Thailand League', time: '16:00', type: 'กิจกรรม' },
    { id: 6, date: '2026-03-25', title: 'Workshop: Financial Planning', project: 'ELP Batch 5', time: '13:00', type: 'Workshop' },
    { id: 7, date: '2026-03-28', title: 'ประชุม Review NU Hackathon', project: 'NU Hackathon', time: '10:00', type: 'ประชุม' },
];

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function E_Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
    const [events, setEvents] = useState(INIT_EVENTS);
    const [filterProject, setFilterProject] = useState('ทั้งหมด');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ date: '', title: '', project: 'Startup Thailand League', time: '', type: 'ประชุม' });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const filteredEvents = events.filter(e => filterProject === 'ทั้งหมด' || e.project === filterProject);

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredEvents.filter(e => e.date === dateStr);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        setEvents(prev => [...prev, { id: Date.now(), ...newEvent }]);
        setIsAddOpen(false);
        setNewEvent({ date: '', title: '', project: 'Startup Thailand League', time: '', type: 'ประชุม' });
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ปฏิทิน</h1>
                    <p className="text-gray-500 text-sm mt-1">กำหนดการกิจกรรมทุกโครงการ</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                    <Plus size={18} /> เพิ่มกำหนดการ
                </button>
            </div>

            {/* Project filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={16} className="text-gray-400" />
                {['ทั้งหมด', ...Object.keys(PROJECT_COLORS)].map(p => (
                    <button key={p} onClick={() => setFilterProject(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterProject === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                            }`}>
                        {filterProject !== 'ทั้งหมด' && p !== 'ทั้งหมด' && PROJECT_COLORS[p] && (
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${PROJECT_COLORS[p]?.dot}`} />
                        )}
                        {p}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100"><ChevronLeft size={20} /></button>
                        <h2 className="font-bold text-gray-900">{MONTHS_TH[month]} {year + 543}</h2>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-100"><ChevronRight size={20} /></button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_TH.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const evs = getEventsForDay(day);
                            return (
                                <div key={day} className="min-h-[70px] p-1.5 rounded-xl border border-transparent hover:bg-gray-50 transition-colors">
                                    <div className="text-xs font-bold text-gray-600 mb-1 w-6 h-6 flex items-center justify-center">{day}</div>
                                    <div className="space-y-0.5">
                                        {evs.slice(0, 2).map((ev, idx) => {
                                            const colors = PROJECT_COLORS[ev.project];
                                            return (
                                                <div key={idx} className={`${colors?.bar || 'bg-gray-400'} text-white text-[8px] rounded px-1 py-0.5 font-bold truncate leading-tight`}>
                                                    {ev.title}
                                                </div>
                                            );
                                        })}
                                        {evs.length > 2 && <div className="text-[8px] text-gray-400 pl-1">+{evs.length - 2} อื่นๆ</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Event list */}
                <div className="space-y-3">
                    <h2 className="font-bold text-gray-900">กำหนดการ ({filteredEvents.length} รายการ)</h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {filteredEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
                            const colors = PROJECT_COLORS[ev.project];
                            const d = new Date(ev.date);
                            return (
                                <div key={ev.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${colors?.dot || 'bg-gray-400'} mt-1 shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 leading-snug">{ev.title}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{d.getDate()} {MONTHS_TH[d.getMonth()]} · {ev.time}</p>
                                            <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${colors?.badge || 'bg-gray-100 text-gray-500'}`}>{ev.project}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[460px] shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="font-bold text-lg">เพิ่มกำหนดการ</h2>
                            <button onClick={() => setIsAddOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกิจกรรม *</label>
                                <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ *</label>
                                    <input required type="date" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label>
                                    <input type="time" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newEvent.project} onChange={(e) => setNewEvent({ ...newEvent, project: e.target.value })}>
                                    {Object.keys(PROJECT_COLORS).map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}>
                                    {['ประชุม', 'กำหนดส่ง', 'กิจกรรม', 'Workshop', 'อื่นๆ'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700">เพิ่ม</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
