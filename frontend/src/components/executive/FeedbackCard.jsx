import React from 'react';
import { MessageSquare, User, Calendar, Star } from 'lucide-react';

const FeedbackCard = ({ feedback }) => {
    const { user_name, project_name, comment, date, rating } = feedback;
    
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <User className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 truncate">{user_name}</h4>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{project_name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={10} 
                                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                                <Calendar size={10} />
                                {new Date(date).toLocaleDateString('th-TH')}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                        <MessageSquare className="text-gray-200 flex-shrink-0" size={16} />
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
