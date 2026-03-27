// pages/participant/P_Calendar.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Loader2, AlertCircle, X, ExternalLink } from 'lucide-react';
import { participantFetch, getParticipantFetchErrorMessage } from '../../lib/participantApi';

const DAYS_TH = [
    { key: 'sun', label: 'อา' },
    { key: 'mon', label: 'จ' },
    { key: 'tue', label: 'อ' },
    { key: 'wed', label: 'พ' },
    { key: 'thu', label: 'พฤ' },
    { key: 'fri', label: 'ศ' },
    { key: 'sat', label: 'ส' },
];

const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

export default function P_Calendar() {
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await participantFetch('/api/participants-data/calendar');
                if (!res.ok) throw new Error('โหลดปฏิทินไม่สำเร็จ');
                const data = await res.json();
                setEvents(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(getParticipantFetchErrorMessage(e, 'โหลดปฏิทินไม่สำเร็จ'));
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const getEventsForDay = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter((e) => e.date === dateStr);
    };

    const upcoming = useMemo(() => {
        return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [events]);

    const today = new Date();
    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-emerald-500 mb-2" size={36} />
                <p className="text-gray-500 text-sm">กำลังโหลดปฏิทิน...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex gap-3 text-red-700">
                <AlertCircle />
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">ปฏิทินกิจกรรม</h1>
            <p className="text-sm text-gray-500 -mt-4">กำหนดจากงานและวันที่โครงการที่ทีมของคุณเข้าร่วม</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <button type="button" onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="font-bold text-gray-900">
                            {MONTHS_TH[month]} {year + 543}
                        </h2>
                        <button type="button" onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAYS_TH.map((d) => (
                            <div key={d.key} className="text-center text-xs font-bold text-gray-400 py-2">
                                {d.label}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${year}-${month}-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const evs = getEventsForDay(day);
                            const todayCell = isToday(day);
                            return (
                                <div
                                    key={`day-${year}-${month}-${day}`}
                                    className={`min-h-[64px] p-1 rounded-xl border ${todayCell ? 'border-emerald-300 bg-emerald-50' : 'border-transparent hover:bg-gray-50'} transition-colors`}
                                >
                                    <div
                                        className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${todayCell ? 'bg-emerald-500 text-white' : 'text-gray-600'
                                            }`}
                                    >
                                        {day}
                                    </div>
                                    <div className="space-y-0.5">
                                        {evs.map((ev, ei) => (
                                            <button
                                                key={`${ev.date}-${ev.title}-${ev.kind}-${ev.eventId ?? ''}-${ei}`}
                                                type="button"
                                                title="คลิกดูรายละเอียด"
                                                onClick={() => setDetail(ev)}
                                                className={`${ev.color} text-white text-[8px] rounded px-1 py-0.5 font-bold truncate leading-tight w-full text-left cursor-pointer hover:opacity-90 hover:ring-1 hover:ring-white/80`}
                                            >
                                                {ev.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <CalIcon size={18} className="text-emerald-600" /> กำหนดการที่ใกล้มา
                    </h2>
                    {upcoming.length === 0 ? (
                        <p className="text-sm text-gray-500">ยังไม่มีกำหนดการในระบบ</p>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((ev, idx) => {
                                const d = new Date(ev.date);
                                return (
                                    <button
                                        key={`up-${idx}-${ev.date}-${ev.title}-${ev.kind}`}
                                        type="button"
                                        onClick={() => setDetail(ev)}
                                        className={`w-full text-left p-4 rounded-2xl border ${ev.bg || 'bg-gray-50'} border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer`}
                                    >
                                        <div className={`text-[10px] font-bold ${ev.textColor || 'text-gray-600'} mb-1 uppercase`}>
                                            {ev.project}
                                        </div>
                                        <div className="font-bold text-gray-900 text-sm">{ev.title}</div>
                                        <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                                            <CalIcon size={12} />
                                            {d.getDate()} {MONTHS_TH[d.getMonth()]} {d.getFullYear() + 543}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {detail && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cal-detail-title"
                    onClick={() => setDetail(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start gap-3">
                            <h2 id="cal-detail-title" className="text-lg font-bold text-gray-900 pr-2">
                                {detail.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setDetail(null)}
                                className="shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                                aria-label="ปิด"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">โครงการ:</span> {detail.project}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">ประเภท:</span>{' '}
                            {detail.kind === 'task' ? 'งาน (Task)' : 'กำหนดการโครงการ'}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">วันที่:</span> {detail.date}
                        </p>
                        <div className="flex flex-wrap justify-end gap-2 pt-3">
                            <button
                                type="button"
                                onClick={() => setDetail(null)}
                                className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700"
                            >
                                ปิด
                            </button>
                            {detail.eventId != null && String(detail.eventId) !== '' && (
                                <Link
                                    to={`/participant/projects/${detail.eventId}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                                    onClick={() => setDetail(null)}
                                >
                                    เปิดหน้าโครงการ
                                    <ExternalLink size={14} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
