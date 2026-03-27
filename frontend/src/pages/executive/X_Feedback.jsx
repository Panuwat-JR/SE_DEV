import React, { useState, useEffect } from 'react';
import { MessageCircle, Filter, Search } from 'lucide-react';
import FeedbackCard from '../../components/executive/FeedbackCard';

export default function X_Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/feedbacks');
                const data = await response.json();
                setFeedbacks(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching feedbacks:", error);
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500 animate-pulse font-medium">กำลังโหลดความคิดเห็น...</div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Participant Feedback</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium italic">
                        "เสียงสะท้อนจากนิสิตผู้เข้าร่วมโครงการ — ร่วมสร้างสรรค์อนาคต"
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 bg-white border border-gray-200 rounded-lg h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 bg-white border border-gray-200 rounded-lg h-9 w-9 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {feedbacks.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
                    <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-400">ยังไม่มีข้อเสนอแนะในขณะนี้</h2>
                    <p className="text-gray-400 text-sm">เมื่อมีการตอบกลับจากผู้เข้าร่วม ข้อมูลจะปรากฏที่นี่</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {feedbacks.map(f => (
                        <FeedbackCard key={f.id} feedback={f} />
                    ))}
                </div>
            )}
        </div>
    );
}
