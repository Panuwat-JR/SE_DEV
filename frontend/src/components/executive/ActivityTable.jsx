import React from 'react';

const ActivityTable = ({ activities }) => {
    if (!activities || activities.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">โครงการล่าสุด</h3>
                <button className="text-blue-600 text-xs font-semibold hover:underline">ดูทั้งหมด</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-5 py-3">ชื่อโครงการ</th>
                            <th className="px-5 py-3">สถานะ</th>
                            <th className="px-5 py-3">วันที่เริ่ม</th>
                            <th className="px-5 py-3 text-right">งบประมาณ/รางวัล</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {activities.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-4 font-semibold text-gray-800">{item.title}</td>
                                <td className="px-5 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        item.status === 'เสร็จสิ้น' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-gray-500 text-sm">{item.date_text}</td>
                                <td className="px-5 py-4 text-right text-gray-900 font-mono text-sm">{item.prize_pool}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityTable;
