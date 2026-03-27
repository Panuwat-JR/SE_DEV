import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import { MessageCircle, Filter, Search, X } from 'lucide-react';
import FeedbackCard from '../../components/executive/FeedbackCard';
import FeedbackStats from '../../components/executive/FeedbackStats';
import FeedbackCharts from '../../components/executive/FeedbackCharts';
=======
import { Filter, RefreshCw, MessageSquare } from 'lucide-react';
import FeedbackStats from '../../components/executive/FeedbackStats';
import FeedbackCharts from '../../components/executive/FeedbackCharts';
import FeedbackCard from '../../components/executive/FeedbackCard';
>>>>>>> Stashed changes

export default function X_Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
    const [showFilters, setShowFilters] = useState(false);
    
    // Filters
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (selectedYear) queryParams.append('academic_year', selectedYear);
            if (selectedEvent) queryParams.append('event_id', selectedEvent);

            const [feedbacksRes, statsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/feedbacks?${queryParams}`),
                fetch(`http://localhost:5000/api/feedbacks/stats?${queryParams}`)
            ]);

            const [feedbacksData, statsData] = await Promise.all([
                feedbacksRes.json(),
                statsRes.json()
            ]);

            setFeedbacks(feedbacksData);
            setStats(statsData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching feedback data:", error);
            setLoading(false);
=======
    const [refreshing, setRefreshing] = useState(false);
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
            const [statsRes, listRes] = await Promise.all([
                fetch(`http://localhost:5000/api/feedback/stats?academic_year=${filters.academicYear}${filters.projectId !== 'all' ? `&event_id=${filters.projectId}` : ''}`),
                fetch(`http://localhost:5000/api/feedback?academic_year=${filters.academicYear}${filters.projectId !== 'all' ? `&event_id=${filters.projectId}` : ''}`)
            ]);
            
            const stats = await statsRes.json();
            const list = await listRes.json();
            
            setData({
                summary: stats.summary || {},
                projectBreakdown: stats.projectBreakdown || [],
                list: list || []
            });
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
>>>>>>> Stashed changes
        }
    };

    useEffect(() => {
        fetchData();
<<<<<<< Updated upstream
    }, [selectedYear, selectedEvent]);

    if (loading && !stats) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังโหลดข้อมูล...</div>
=======
    }, [filters]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังรวบรวมข้อมูล Feedback...</div>
>>>>>>> Stashed changes
        </div>
    );

    return (
<<<<<<< Updated upstream
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Executive Feedback</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">
                        "เสียงสะท้อนจากนิสิต — ข้อมูลประกอบการตัดสินใจเชิงกลยุทธ์"
                    </p>
=======
        <div className="space-y-8 pb-10">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Feedback & Sentiment</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">วิเคราะห์เสียงสะท้อนจากผู้เข้าร่วมโครงการ NU SEED</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-2 text-gray-400">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">ตัวกรอง</span>
                    </div>
                    <select 
                        className="bg-gray-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-blue-500 px-3 py-1.5 font-medium outline-none"
                        value={filters.academicYear}
                        onChange={(e) => setFilters({...filters, academicYear: e.target.value})}
                    >
                        <option value="all">ปีการศึกษาทั้งหมด</option>
                        <option value="2567">ปีการศึกษา 2567</option>
                        <option value="2566">ปีการศึกษา 2566</option>
                    </select>
                    <button 
                        onClick={fetchData}
                        className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <FeedbackStats summary={data.summary} />

            {/* Charts Section */}
            <FeedbackCharts 
                summary={data.summary} 
                projectBreakdown={data.projectBreakdown} 
            />

            {/* Feedback List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={18} />
                        ความคิดเห็นล่าสุด ({data.list.length})
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.list.length > 0 ? (
                        data.list.map((item) => (
                            <FeedbackCard key={item.id} feedback={item} />
                        ))
                    ) : (
                        <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
                            <p className="text-gray-400 italic">ไม่พบข้อมูลความเห็นในช่วงเวลาที่เลือก</p>
                        </div>
                    )}
>>>>>>> Stashed changes
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 border rounded-xl transition-all flex items-center gap-2 px-4 text-sm font-medium ${showFilters ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter size={18} />
                        เครื่องมือกรอง
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900">กรองข้อมูล</h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ปีการศึกษา</label>
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">ทุกปีการศึกษา</option>
                                <option value="2567">2567</option>
                                <option value="2566">2566</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">โครงการ</label>
                            <select 
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">ทุกโครงการ</option>
                                {stats?.projectBreakdown?.map(p => (
                                    <option key={p.name} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            {stats && <FeedbackStats stats={stats.summary} />}

            {/* Charts Section */}
            {stats && <FeedbackCharts stats={stats.summary} projects={stats.projectBreakdown} />}

            {/* Feedback Feed */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">รายการความคิดเห็นล่าสุด</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                        {feedbacks.length} ความคิดเห็น
                    </span>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
                        <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                        <h2 className="text-xl font-bold text-gray-400">ไม่พบข้อเสนอแนะที่ตรงตามเงื่อนไข</h2>
                        <button onClick={() => {setSelectedYear(''); setSelectedEvent('');}} className="mt-4 text-blue-600 text-sm font-bold">ล้างการกรองทั้งหมด</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {feedbacks.map(f => (
                            <FeedbackCard key={f.id} feedback={f} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
