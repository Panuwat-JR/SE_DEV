// pages/employee/E_Calendar.jsx
// ดึงจาก GET /api/employees/calendar (งานมีกำหนดส่ง + วันเริ่ม/จบโครงการ)
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const PALETTE = [
    { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
    { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500' },
    { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500' },
    { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
    { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', bar: 'bg-rose-500' },
    { dot: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-700', bar: 'bg-cyan-500' },
    { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
    { dot: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', bar: 'bg-indigo-500' },
];

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function buildProjectColorizer(items) {
    const map = new Map();
    let i = 0;
    for (const ev of items) {
        const p = ev.project || 'ไม่ระบุ';
        if (!map.has(p)) {
            map.set(p, i % PALETTE.length);
            i += 1;
        }
    }
    return (project) => PALETTE[map.get(project || 'ไม่ระบุ') ?? 0];
}

export default function E_Calendar() {
    const { employee } = useAuth();
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterProject, setFilterProject] = useState('ทั้งหมด');

    useEffect(() => {
        const id = employee?.id;
        const q =
            id != null && Number.isFinite(Number(id))
                ? `?employee_id=${encodeURIComponent(String(id))}`
                : '';
        const url = API_BASE
            ? `${API_BASE}/api/employees/calendar${q}`
            : `/api/employees/calendar${q}`;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(url);
                const data = await res.json().catch(() => []);
                if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
                if (!cancelled) setEvents(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) {
                    setError(
                        e?.message === 'Failed to fetch' || e?.name === 'TypeError'
                            ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
                            : e.message
                    );
                    setEvents([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [employee?.id]);

    const projectNames = useMemo(() => {
        const s = new Set();
        events.forEach((e) => s.add(e.project || 'ไม่ระบุ'));
        return ['ทั้งหมด', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'th'))];
    }, [events]);

    const colorFor = useMemo(() => buildProjectColorizer(events), [events]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const filteredEvents = events.filter(
        (e) => filterProject === 'ทั้งหมด' || (e.project || 'ไม่ระบุ') === filterProject
    );

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredEvents.filter((e) => e.date === dateStr);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-24 text-gray-500 text-sm">
                <Loader2 className="animate-spin" size={22} />
                กำลังโหลดปฏิทิน...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50/90 p-6 text-red-800 text-sm">
                <AlertCircle className="shrink-0" size={22} />
                <div>
                    <p className="font-semibold">โหลดปฏิทินไม่สำเร็จ</p>
                    <p className="text-red-700/90 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ปฏิทิน</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        กำหนดส่งงาน (due date) และวันเริ่ม/สิ้นสุดโครงการจากฐานข้อมูล — เพิ่มกำหนดการได้จากหน้างานและกิจกรรม
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={16} className="text-gray-400 shrink-0" />
                {projectNames.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setFilterProject(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            filterProject === p
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                        }`}
                    >
                        {p !== 'ทั้งหมด' && (
                            <span
                                className={`inline-block w-2 h-2 rounded-full mr-1.5 ${colorFor(p).dot}`}
                            />
                        )}
                        {p}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <button
                            type="button"
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            className="p-1.5 rounded-xl hover:bg-gray-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="font-bold text-gray-900">
                            {MONTHS_TH[month]} {year + 543}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            className="p-1.5 rounded-xl hover:bg-gray-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_TH.map((d) => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`e${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const evs = getEventsForDay(day);
                            return (
                                <div
                                    key={day}
                                    className="min-h-[70px] p-1.5 rounded-xl border border-transparent hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-xs font-bold text-gray-600 mb-1 w-6 h-6 flex items-center justify-center">
                                        {day}
                                    </div>
                                    <div className="space-y-0.5">
                                        {evs.slice(0, 2).map((ev) => {
                                            const colors = colorFor(ev.project);
                                            return (
                                                <div
                                                    key={ev.id}
                                                    className={`${colors.bar} text-white text-[8px] rounded px-1 py-0.5 font-bold truncate leading-tight`}
                                                    title={`${ev.title} · ${ev.type}`}
                                                >
                                                    {ev.title}
                                                </div>
                                            );
                                        })}
                                        {evs.length > 2 && (
                                            <div className="text-[8px] text-gray-400 pl-1">+{evs.length - 2} อื่นๆ</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="font-bold text-gray-900">กำหนดการ ({filteredEvents.length} รายการ)</h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {filteredEvents.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-10">ไม่มีรายการในเดือนที่เลือกหรือในระบบ</p>
                        ) : (
                            [...filteredEvents]
                                .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
                                .map((ev) => {
                                    const colors = colorFor(ev.project);
                                    const d = new Date(ev.date + 'T12:00:00');
                                    return (
                                        <div
                                            key={ev.id}
                                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} mt-1 shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 leading-snug">{ev.title}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {d.getDate()} {MONTHS_TH[d.getMonth()]} · {ev.time || '—'} · {ev.type}
                                                    </p>
                                                    <span
                                                        className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${colors.badge}`}
                                                    >
                                                        {ev.project}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
