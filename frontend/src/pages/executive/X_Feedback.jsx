// pages/executive/X_Feedback.jsx
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';

export default function X_Feedback() {
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState([]);

    useEffect(() => {
        // Placeholder for API fetching logic
        const fetchFeedbackData = async () => {
            try {
                // To be implemented: fetch('http://localhost:5000/api/feedback')
                setLoading(false);
            } catch (error) {
                console.error("Error fetching feedback data:", error);
                setLoading(false);
            }
        };

        fetchFeedbackData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Feedback ภาพรวม</h1>
                <p className="text-gray-500 text-sm mt-1">รวบรวม feedback ของผู้เข้าร่วมจากทุกโครงการ — ข้อมูลจากระบบจริง</p>
            </div>

            {/* Summary Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl font-bold text-gray-200 mb-2">0.0</div>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} className="text-gray-200" />)}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">ยังไม่มีคะแนนเฉลี่ย</p>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-center">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-gray-300" /> คะแนนแต่ละด้าน
                    </h2>
                    <div className="text-gray-400 text-center py-4 italic">
                        รอข้อมูลจากการประเมินโครงการ
                    </div>
                </div>
            </div>

            {/* Individual feedback Placeholder */}
            <div>
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-gray-300" /> ความคิดเห็นทั้งหมด (0)
                </h2>
                <div className="bg-white rounded-2xl border border-dotted border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">ยังไม่มีความคิดเห็น</h3>
                    <p className="text-gray-500 max-w-xs mt-2">
                        เมื่อมีการส่ง Feedback จากผู้เข้าร่วม ข้อมูลจะปรากฏที่นี่
                    </p>
                </div>
            </div>
        </div>
    );
}
