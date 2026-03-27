import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, MessageSquare, Search, X, MessageCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';
import FeedbackStats from '../../components/executive/FeedbackStats';
import FeedbackCharts from '../../components/executive/FeedbackCharts';
import FeedbackCard from '../../components/executive/FeedbackCard';

export default function X_Feedback() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [data, setData] = useState({
        summary: {},
        projectBreakdown: [],
        list: []
    });
    const [filters, setFilters] = useState({
        academicYear: 'all',
        projectId: 'all'
    });

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const academicYearParam = filters.academicYear !== 'all' ? `academic_year=${filters.academicYear}` : 'academic_year=all';
            const projectIdParam =
                filters.projectId !== 'all' && filters.projectId != null && filters.projectId !== ''
                    ? `&event_id=${encodeURIComponent(filters.projectId)}`
                    : '';
            const apiRoot = API_BASE ? `${API_BASE}/api` : '/api';

            const [statsRes, listRes] = await Promise.all([
                fetch(`${apiRoot}/feedback/stats?${academicYearParam}${projectIdParam}`),
                fetch(`${apiRoot}/feedback?${academicYearParam}${projectIdParam}`)
            ]);

            const stats = await statsRes.json().catch(() => ({}));
            const listRaw = await listRes.json().catch(() => []);

            const summary =
                stats && typeof stats === 'object' && !stats.error && stats.summary
                    ? stats.summary
                    : {};
            const projectBreakdown = Array.isArray(stats?.projectBreakdown)
                ? stats.projectBreakdown
                : [];
            const list = Array.isArray(listRaw) ? listRaw : [];

            setData({
                summary,
                projectBreakdown,
                list
            });
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    if (loading && data.summary.total_responses == null) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังรวบรวมข้อมูล Feedback...</div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Feedback</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">วิเคราะห์เสียงสะท้อนจากผู้เข้าร่วมโครงการ NU SEED</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
                    >
                        <Filter size={16} />
                        ตัวกรอง
                    </button>
                    <button 
                        onClick={fetchData}
                        className={`p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">การกรองข้อมูลแบบละเอียด</h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">ปีการศึกษา</label>
                            <select 
                                className="w-full bg-gray-50 border-none text-sm rounded-xl focus:ring-2 focus:ring-blue-500 p-3 font-medium outline-none"
                                value={filters.academicYear}
                                onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                            >
                                <option value="all">ปีทำการศึกษาทั้งหมด</option>
                                <option value="2567">2567</option>
                                <option value="2566">2566</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">โครงการเป้าหมาย</label>
                            <select 
                                className="w-full bg-gray-50 border-none text-sm rounded-xl focus:ring-2 focus:ring-blue-500 p-3 font-medium outline-none"
                                value={filters.projectId}
                                onChange={(e) => setFilters({...filters, projectId: e.target.value})}
                            >
                                <option value="all">ทุกโครงการ</option>
                                {data.projectBreakdown.map((p, idx) => (
                                    <option
                                        key={p.id != null ? String(p.id) : `row-${idx}`}
                                        value={p.id != null ? String(p.id) : ''}
                                    >
                                        {p.id === '__unassigned__' ? `${p.name} (ไม่ระบุโครงการ)` : `${p.name} (${p.score})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <FeedbackStats stats={data.summary} />

            {/* Charts Section */}
            <FeedbackCharts 
                stats={data.summary} 
                projects={data.projectBreakdown} 
            />

            {/* Feedback List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={20} />
                        ความคิดเห็นล่าสุด ({data.list.length})
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.list.length > 0 ? (
                        data.list.map((item) => (
                            <FeedbackCard key={item.id} feedback={item} />
                        ))
                    ) : (
                        <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-20 text-center">
                            <MessageCircle size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 italic font-medium">ไม่พบข้อความแสดงความคิดเห็นในช่วงเวลานี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
