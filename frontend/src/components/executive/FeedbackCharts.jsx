import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const FeedbackCharts = ({ stats, projects }) => {
    // 1. Sentiment Data for Doughnut Chart
    const sentimentData = [
        { name: 'แง่บวก (4-5)', value: Number(stats.positive_count) || 0, color: '#10b981' },
        { name: 'เป็นกลาง (3)', value: Number(stats.neutral_count) || 0, color: '#f59e0b' },
        { name: 'แง่ลบ (1-2)', value: Number(stats.negative_count) || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // 2. Project Breakdown Data for Bar Chart
    const barData = projects?.map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        score: Number(p.score)
    })) || [];

    const BAR_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Doughnut Chart: Sentiment */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-6">สัดส่วนความรู้สึกนิสิต</h4>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {sentimentData.map((d, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                            <span className="text-[10px] text-gray-500">{d.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bar Chart: Comparison */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-6">ความพึงพอใจรายโครงการ</h4>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis domain={[0, 5]} fontSize={10} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                                {barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default FeedbackCharts;
