import React from 'react';
import { MessageSquare, User, Calendar } from 'lucide-react';

const FeedbackCard = ({ feedback }) => {
    const { user_name, project_name, comment, date } = feedback;
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 truncate">{user_name}</h4>
                            <p className="text-xs text-blue-600 font-medium">{project_name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                            <Calendar size={12} />
                            {new Date(date).toLocaleDateString('th-TH')}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                        <MessageSquare className="text-gray-300 flex-shrink-0" size={16} />
                        <p className="text-gray-600 text-sm leading-relaxed italic">
                            "{comment}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackCard;
