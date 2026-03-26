import React from 'react';

const StatsCard = ({ label, value, sub, icon: Icon, color, bg }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all hover:shadow-md">
            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
            </div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
        </div>
    );
};

export default StatsCard;
