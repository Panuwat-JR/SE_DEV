// pages/executive/X_Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, Star } from 'lucide-react';

export default function X_Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        // Placeholder for API fetching logic
        const fetchDashboardData = async () => {
            try {
                // To be implemented: fetch('http://localhost:5000/api/dashboard')
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">ภาพรวมการดำเนินงาน NU SEED — ข้อมูลจากระบบจริง</p>
            </div>

            {/* KPI Cards Placeholder */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'โครงการทั้งหมด', value: '0', sub: 'โครงการ', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'ทีมรวม', value: '0', sub: 'ทีม', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'งบฯ ที่ใช้', value: '0', sub: 'บาท', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Feedback เฉลี่ย', value: '0.0', sub: '/ 5.0 ดาว', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className={`w-10 h-10 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={20} />
                            </div>
                            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
                            <div className="text-sm font-semibold text-gray-700 mt-0.5">{kpi.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Content Area Placeholder */}
            <div className="bg-white rounded-2xl border border-dotted border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Activity className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ยังไม่มีข้อมูลแสดงผล</h3>
                <p className="text-gray-500 max-w-xs mt-2">
                    หน้าแดชบอร์ดกำลังรอการเชื่อมต่อข้อมูลจริงจากฐานข้อมูล
                </p>
            </div>
        </div>
    );
}
