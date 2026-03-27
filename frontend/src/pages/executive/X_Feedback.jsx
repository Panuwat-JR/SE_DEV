import React, { useState, useEffect } from 'react';
import { MessageCircle, Filter, Search, X } from 'lucide-react';
import FeedbackCard from '../../components/executive/FeedbackCard';
import FeedbackStats from '../../components/executive/FeedbackStats';
import FeedbackCharts from '../../components/executive/FeedbackCharts';

export default function X_Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
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
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedYear, selectedEvent]);

    if (loading && !stats) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังโหลดข้อมูล...</div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Executive Feedback</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">
                        "เสียงสะท้อนจากนิสิต — ข้อมูลประกอบการตัดสินใจเชิงกลยุทธ์"
                    </p>
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
