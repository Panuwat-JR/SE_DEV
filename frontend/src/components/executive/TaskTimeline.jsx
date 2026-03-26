import React from 'react';
import { Clock } from 'lucide-react';

const TaskTimeline = ({ tasks }) => {
    if (!tasks || tasks.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                งานที่เพิ่งอัปเดต
            </h3>
            <div className="space-y-6">
                {tasks.map((task, idx) => (
                    <div key={task.id} className="relative pl-6 pb-2 last:pb-0">
                        {idx !== tasks.length - 1 && (
                            <div className="absolute left-[3px] top-6 bottom-0 w-[1px] bg-gray-100"></div>
                        )}
                        <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"></div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{task.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{task.project_name}</div>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex-1 h-1 bg-gray-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-500" 
                                        style={{ width: `${task.progress_percent}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{task.progress_percent}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskTimeline;
