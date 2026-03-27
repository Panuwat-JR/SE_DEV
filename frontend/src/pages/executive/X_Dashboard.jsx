// pages/executive/X_Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';
import StatsCard from '../../components/executive/StatsCard';
import ActivityTable from '../../components/executive/ActivityTable';
import TaskTimeline from '../../components/executive/TaskTimeline';

export default function X_Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/api/dashboard-data`);
                const result = await response.json().catch(() => ({}));
                if (!response.ok) {
                    setData(null);
                    setError(
                        result?.error ||
                            result?.details ||
                            `โหลดข้อมูลไม่สำเร็จ (HTTP ${response.status})`
                    );
                    return;
                }
                setData(result);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setData(null);
                setError(
                    err?.message === 'Failed to fetch' || err?.name === 'TypeError'
                        ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบว่ารัน Backend และตั้งค่า proxy / VITE_API_BASE'
                        : err?.message || 'เกิดข้อผิดพลาดขณะโหลดข้อมูล'
                );
            } finally {
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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <AlertCircle size={40} className="text-red-400 mb-3" aria-hidden />
                <p className="text-gray-800 font-semibold">ไม่สามารถโหลด Executive Dashboard ได้</p>
                <p className="text-gray-500 text-sm mt-2 max-w-md">{error}</p>
            </div>
        );
    }

    const stats = [
        { label: 'โครงการทั้งหมด', value: data?.stats?.total_activities || '0', sub: 'ชิ้นงานทั้งหมด', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'ทีมรวม', value: data?.stats?.registered_teams || '0', sub: 'ทีมที่ลงทะเบียน', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'งบประมาณที่ใช้', value: data?.stats?.total_budget?.toLocaleString() || '0', sub: 'บาท', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
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
