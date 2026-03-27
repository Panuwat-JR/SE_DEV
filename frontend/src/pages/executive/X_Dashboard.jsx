// pages/executive/X_Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Star } from 'lucide-react';
import StatsCard from '../../components/executive/StatsCard';
import ActivityTable from '../../components/executive/ActivityTable';
import TaskTimeline from '../../components/executive/TaskTimeline';

export default function X_Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/dashboard-data');
                const result = await response.json();
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังโหลดข้อมูลภาพรวม...</div>
        </div>
    );

    const stats = [
        { label: 'โครงการทั้งหมด', value: data?.stats?.total_activities || '0', sub: 'ชิ้นงานทั้งหมด', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'ทีมรวม', value: data?.stats?.registered_teams || '0', sub: 'ทีมที่ลงทะเบียน', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'งบฯ ที่ใช้', value: data?.stats?.total_budget?.toLocaleString() || '0', sub: 'บาท', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Feedback', value: data?.stats?.avg_feedback || '0.0', sub: 'คะแนนความพึงพอใจ', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">ภาพรวมการดำเนินงาน NU SEED — เรียลไทม์จากฐานข้อมูล</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => <StatsCard key={i} {...s} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <ActivityTable activities={data?.upcomingActivities} />
                </div>
                <div>
                    <TaskTimeline tasks={data?.recentTasks} />
                </div>
            </div>
        </div>
    );
}
