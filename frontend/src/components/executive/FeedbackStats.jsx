import React from 'react';
import { Star, MessageCircle, TrendingUp, Users } from 'lucide-react';

const FeedbackStats = ({ stats }) => {
    const { total_responses, avg_rating, positive_count } = stats;
    
    // Calculate percentage of positive feedback
    const positivePercent = total_responses > 0 
        ? Math.round((positive_count / total_responses) * 100) 
        : 0;

    const cards = [
        {
            title: 'คะแนนเฉลี่ย',
            value: avg_rating || '0.0',
            icon: <Star className="text-yellow-500" size={24} />,
            color: 'bg-yellow-50',
            subtitle: 'จาก 5.0 คะแนนเต็ม'
        },
        {
            title: 'จำนวนผู้ตอบ',
            value: total_responses || 0,
            icon: <Users className="text-blue-500" size={24} />,
            color: 'bg-blue-50',
            subtitle: 'นิสิตที่ให้ข้อมูล'
        },
        {
            title: 'ความแง่บวก',
            value: `${positivePercent}%`,
            icon: <TrendingUp className="text-green-500" size={24} />,
            color: 'bg-green-50',
            subtitle: 'คอมเมนต์ระดับ 4-5 ดาว'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
                            <p className="text-xs text-gray-400 mt-2">{card.subtitle}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${card.color}`}>
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeedbackStats;
