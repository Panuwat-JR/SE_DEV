import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowUpDown,
    Calendar,
    Clock,
    Filter,
    Loader2,
    Search,
    Trophy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_FILTERS = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'in_progress', label: 'กำลังดำเนินการ' },
    { id: 'planning', label: 'วางแผน' },
    { id: 'completed', label: 'ดำเนินการสำเร็จ' }
];

function normalizeText(v) {
    return String(v ?? '').toLowerCase().trim();
}

function computeProgressPercent(proj) {
    // ใช้ progress จาก backend เป็นหลัก (backend อาจมี logic เพิ่มเติมให้ % ต่างกัน)
    const p = Number(proj?.progress);
    if (Number.isFinite(p)) {
        return Math.max(0, Math.min(100, Math.round(p)));
    }

    const done = parseInt(proj?.doneItems ?? proj?.done, 10);
    const total = parseInt(proj?.totalItems ?? proj?.total, 10);
    if (Number.isFinite(done) && Number.isFinite(total) && total > 0) {
        return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
    }

    return 0;
}

function parseDDMMYYYY(s) {
    // Expect "DD/MM/YYYY"
    const m = String(s ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const [_, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
}

export default function P_Projects() {
    const { teamRole } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('progress_desc'); // progress_desc | deadline_asc | title_asc

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/dashboard-data/participant-data');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                console.error('Error fetching participant projects:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const stats = useMemo(() => {
        const total = projects.length;
        const inProgress = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
        const planning = projects.filter(p => p.status === 'วางแผน').length;
        const completed = projects.filter(p => p.status === 'ดำเนินการสำเร็จ').length;
        return { total, inProgress, planning, completed };
    }, [projects]);

    const filtered = useMemo(() => {
        const q = normalizeText(query);
        let list = projects.slice();

        if (status !== 'all') {
            const statusText =
                status === 'in_progress' ? 'กำลังดำเนินการ'
                    : status === 'planning' ? 'วางแผน'
                        : status === 'completed' ? 'ดำเนินการสำเร็จ'
                            : '';
            list = list.filter(p => p.status === statusText);
        }

        if (q) {
            list = list.filter(p => {
                const hay = [
                    p.title,
                    p.team,
                    p.role,
                    p.status,
                    p.prize,
                    p.nextTask
                ].map(normalizeText).join(' ');
                return hay.includes(q);
            });
        }

        if (sort === 'progress_desc') {
            list.sort((a, b) => computeProgressPercent(b) - computeProgressPercent(a));
        } else if (sort === 'deadline_asc') {
            list.sort((a, b) => {
                const da = parseDDMMYYYY(a.nextDeadline)?.getTime() ?? Number.POSITIVE_INFINITY;
                const db = parseDDMMYYYY(b.nextDeadline)?.getTime() ?? Number.POSITIVE_INFINITY;
                return da - db;
            });
        } else if (sort === 'title_asc') {
            list.sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? ''), 'th'));
        }

        return list;
    }, [projects, query, status, sort]);

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                ติดตามความคืบหน้าและงานถัดไปได้ในที่เดียว
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                {loading
                                    ? 'กำลังโหลดข้อมูลโครงการ...'
                                    : stats.total > 0
                                        ? `คุณมี ${stats.total} โครงการ · กำลังดำเนินการ ${stats.inProgress} · วางแผน ${stats.planning} · สำเร็จ ${stats.completed}`
                                        : 'ยังไม่พบโครงการที่คุณเข้าร่วมในขณะนี้'
                                }
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
                                {teamRole === 'leader' ? '🏆 หัวหน้าทีม' : '👤 สมาชิกทีม'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="ค้นหาโครงการ, ทีม, สถานะ, งานถัดไป..."
                                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 flex-wrap items-center">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 outline-none"
                                >
                                    {STATUS_FILTERS.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <ArrowUpDown size={16} className="text-gray-400" />
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 outline-none"
                                >
                                    <option value="progress_desc">เรียง: ความคืบหน้า (มาก → น้อย)</option>
                                    <option value="deadline_asc">เรียง: กำหนดส่งใกล้สุด</option>
                                    <option value="title_asc">เรียง: ชื่อโครงการ (A → Z)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map(s => {
                            const active = status === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStatus(s.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            );
                        })}
                        {(query || status !== 'all') && (
                            <button
                                onClick={() => { setQuery(''); setStatus('all'); }}
                                className="px-3 py-1.5 rounded-full text-xs font-bold border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            >
                                ล้างตัวกรอง
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Loader2 className="animate-spin text-emerald-500 mb-2" size={34} />
                    <p className="text-gray-400 text-sm">กำลังโหลดรายการโครงการ...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 p-10 rounded-2xl text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                    <p className="text-red-700 font-bold">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 p-14 rounded-2xl text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy size={30} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">ไม่พบโครงการที่ตรงกับตัวกรอง</h3>
                    <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
                        ลองเปลี่ยนคำค้น หรือกด “ล้างตัวกรอง” เพื่อดูรายการทั้งหมด
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {filtered.map((proj) => {
                        const progress = computeProgressPercent(proj);
                        const hasNext = proj.nextTask && proj.nextTask !== '—';
                        const statusBadge = proj.statusColor || 'bg-gray-100 text-gray-700 border-gray-200';
                        return (
                            <Link
                                to={`/participant/projects/${proj.id}`}
                                key={proj.id}
                                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all"
                            >
                                <div className="relative p-6 space-y-4">
                                    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-100/40 blur-2xl group-hover:bg-emerald-100/60 transition-colors" />
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
                                                    {proj.status}
                                                </span>
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                                                    ทีม: {proj.team}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
                                                {proj.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                บทบาท: <span className="font-bold text-gray-700">{proj.role}</span>
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-gray-400 font-bold">ความคืบหน้า</p>
                                            <p className="text-2xl font-bold text-gray-900 tabular-nums">{progress}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`${proj.progressColor || 'bg-emerald-500'} h-full rounded-full transition-all`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                เสร็จแล้ว <span className="font-bold text-gray-700 tabular-nums">{proj.doneItems}</span>
                                                <span className="text-gray-300"> / </span>
                                                <span className="tabular-nums">{proj.totalItems}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-gray-400">
                                                <Trophy size={12} className="text-amber-500" />
                                                <span className="font-bold text-gray-600">{proj.prize}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`rounded-2xl border p-4 ${hasNext ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${hasNext ? 'bg-white border border-gray-200' : 'bg-gray-50 border border-gray-200'}`}>
                                                {hasNext ? <Clock size={18} className="text-amber-600" /> : <Calendar size={18} className="text-gray-400" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-400 font-bold mb-1">งานถัดไป</p>
                                                <p className="text-sm font-bold text-gray-800 truncate">
                                                    {hasNext ? proj.nextTask : 'ยังไม่มีงานที่ต้องทำ'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    กำหนดส่ง: <span className="font-bold text-gray-700">{hasNext ? proj.nextDeadline : '—'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                                            เปิดรายละเอียด →
                                        </span>
                                        <span className="text-xs font-bold text-gray-400">
                                            ID: {proj.id}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

