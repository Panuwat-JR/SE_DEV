// pages/employee/E_Calendar.jsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const COLOR_PALETTE = [
    { dot: 'bg-blue-500', badge: 'text-blue-600', bar: 'border-l-2 border-blue-500' },
    { dot: 'bg-amber-500', badge: 'text-amber-600', bar: 'border-l-2 border-amber-500' },
    { dot: 'bg-purple-500', badge: 'text-purple-600', bar: 'border-l-2 border-purple-500' },
    { dot: 'bg-emerald-500', badge: 'text-emerald-600', bar: 'border-l-2 border-emerald-500' },
    { dot: 'bg-red-500', badge: 'text-red-600', bar: 'border-l-2 border-red-500' },
    { dot: 'bg-gray-400', badge: 'text-gray-500', bar: 'border-l-2 border-gray-400' },
];

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function E_Calendar() {
    const { events: dbEvents, tasks: dbTasks } = useApp();

    // Build project color map from real events
    const PROJECT_COLORS = useMemo(() => {
        const map = {};
        dbEvents.forEach((ev, idx) => {
            map[ev.title] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        });
        return map;
    }, [dbEvents]);

    // Build calendar events from tasks (due_date) and events (event_start)
    const calendarEvents = useMemo(() => {
        const items = [];
        dbTasks.forEach(t => {
            if (t.due_date) {
                items.push({
                    id: `task-${t.id}`,
                    date: t.due_date,
                    title: t.title || t.task_name,
                    project: t.event || 'ไม่ระบุกิจกรรม',
                    time: 'สิ้นวัน',
                    type: 'กำหนดส่ง',
                });
            }
        });
        dbEvents.forEach(ev => {
            if (ev.event_start) {
                items.push({
                    id: `event-start-${ev.id}`,
                    date: ev.event_start,
                    title: `เริ่ม: ${ev.title}`,
                    project: ev.title,
                    time: '08:00',
                    type: 'กิจกรรม',
                });
            }
            if (ev.event_end) {
                items.push({
                    id: `event-end-${ev.id}`,
                    date: ev.event_end,
                    title: `สิ้นสุด: ${ev.title}`,
                    project: ev.title,
                    time: 'สิ้นวัน',
                    type: 'กิจกรรม',
                });
            }
        });
        return items;
    }, [dbTasks, dbEvents]);

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [events, setEvents] = useState([]);
    const [filterProject, setFilterProject] = useState('ทั้งหมด');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ date: '', title: '', project: '', time: '', type: 'ประชุม' });

    // Merge DB events + locally added events
    const allEvents = [...calendarEvents, ...events];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const filteredEvents = allEvents.filter(e => filterProject === 'ทั้งหมด' || e.project === filterProject);

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredEvents.filter(e => e.date === dateStr);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        setEvents(prev => [...prev, { id: Date.now(), ...newEvent }]);
        setIsAddOpen(false);
        setNewEvent({ date: '', title: '', project: '', time: '', type: 'ประชุม' });
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
                        {p !== 'ทั้งหมด' && PROJECT_COLORS[p] && (
                            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${PROJECT_COLORS[p]?.dot}`} />
                        )}
                        {p}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"><ChevronLeft size={20} /></button>
                        <h2 className="font-bold text-gray-900 text-lg">{MONTHS_TH[month]} {year + 543}</h2>
                        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"><ChevronRight size={20} /></button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_TH.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="bg-white min-h-[90px]" />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const evs = getEventsForDay(day);
                            return (
                                <div key={day} className="min-h-[90px] bg-white p-2 hover:bg-gray-50/50 transition-colors group cursor-pointer relative flex flex-col">
                                    <div className="text-xs font-bold text-gray-400 mb-1 w-6 h-6 flex items-center justify-center group-hover:text-blue-600 transition-colors">{day}</div>
                                    <div className="space-y-1 flex-1">
                                        {evs.slice(0, 2).map((ev, idx) => {
                                            const colors = PROJECT_COLORS[ev.project];
                                            return (
                                                <div key={idx} className={`flex items-center gap-1.5 ${colors?.bar || 'border-l-2 border-gray-300'} bg-gray-50/50 px-1.5 py-1 text-[9px] font-semibold text-gray-700 rounded-r truncate`}>
                                                    <span className="truncate">{ev.title}</span>
                                                </div>
                                            );
                                        })}
                                        {evs.length > 2 && <div className="text-[9px] font-semibold text-gray-400 mt-1 pl-1">+{evs.length - 2} เพิ่มเติม</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Event list */}
                <div className="space-y-4">
                    <h2 className="font-bold text-gray-900">กำหนดการถัดไป ({filteredEvents.length})</h2>
                    <div className="space-y-0 pr-1 max-h-[600px] overflow-y-auto">
                        {filteredEvents.sort((a, b) => a.date.localeCompare(b.date)).map(ev => {
                            const colors = PROJECT_COLORS[ev.project];
                            const d = new Date(ev.date);
                            return (
                                <div key={ev.id} className="group p-4 border-b border-gray-100 last:border-0 hover:bg-white rounded-xl transition-colors cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg w-12 h-12 shrink-0 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                            <span className="text-xs font-bold text-gray-400 uppercase leading-none group-hover:text-blue-500">{MONTHS_TH[d.getMonth()]}</span>
                                            <span className="text-sm font-black text-gray-900 leading-none mt-1 group-hover:text-blue-700">{d.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="text-sm font-bold text-gray-900 truncate leading-snug group-hover:text-blue-600 transition-colors">{ev.title}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="font-medium">{ev.time}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <span className={`font-semibold ${colors?.badge || 'text-gray-500'}`}>{ev.project}</span>
                                            </p>
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
                                    <option value="">-- เลือกโครงการ --</option>
                                    {dbEvents.map(ev => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
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
