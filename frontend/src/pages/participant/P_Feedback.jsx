// pages/participant/P_Feedback.jsx
import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';

const PROJECTS = [
    'Startup Thailand League 2026',
    'ELP Batch 5 — Naresuan',
    'Innovation Challenge 2026',
];

const ASPECTS = ['การจัดการโครงการ', 'การสื่อสาร', 'กระบวนการคัดเลือก', 'สถานที่และสิ่งอำนวยความสะดวก', 'การสนับสนุนจากผู้รับผิดชอบ'];

const PAST_FEEDBACK = [
    { project: 'Innovation Challenge 2026', rating: 4, text: 'โครงการดีมากครับ ทีมงานให้การสนับสนุนเป็นอย่างดี แต่อยากให้มีการแจ้งกำหนดการล่วงหน้ามากกว่านี้', date: '15 ก.พ. 2569' },
];

function StarRater({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(n)}
                    className="transition-transform hover:scale-110">
                    <Star size={28} fill={(hover || value) >= n ? '#f59e0b' : 'none'} className={(hover || value) >= n ? 'text-amber-400' : 'text-gray-300'} />
                </button>
            ))}
        </div>
    );
}

export default function P_Feedback() {
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [ratings, setRatings] = useState({});
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [allFeedback, setAllFeedback] = useState(PAST_FEEDBACK);

    const overallRating = Object.values(ratings).length
        ? Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length)
        : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (overallRating === 0) return;
        setAllFeedback(prev => [{
            project: selectedProject, rating: overallRating, text: comment, date: 'วันนี้'
        }, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setRatings({});
            setComment('');
        }, 3000);
    };

    const STAR_LABELS = ['', 'ต้องปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ยอดเยี่ยม'];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Feedback โครงการ</h1>
                <p className="text-gray-500 text-sm mt-1">แสดงความคิดเห็นเพื่อพัฒนาโครงการให้ดียิ่งขึ้น</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">โครงการที่ต้องการให้ Feedback</label>
                    <div className="flex flex-wrap gap-2">
                        {PROJECTS.map(p => (
                            <button key={p} type="button" onClick={() => setSelectedProject(p)}
                                className={`px-4 py-2 text-sm rounded-xl border font-medium transition-all ${selectedProject === p ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'
                                    }`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">ให้คะแนนในแต่ละด้าน</p>
                    {ASPECTS.map(aspect => (
                        <div key={aspect} className="flex items-center justify-between gap-4 p-3.5 bg-gray-50 rounded-xl">
                            <span className="text-sm text-gray-700 font-medium">{aspect}</span>
                            <div className="flex items-center gap-3 shrink-0">
                                <StarRater value={ratings[aspect] || 0} onChange={(v) => setRatings(r => ({ ...r, [aspect]: v }))} />
                                <span className="text-xs text-gray-400 w-20 text-right">{STAR_LABELS[ratings[aspect] || 0]}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {overallRating > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => <Star key={n} size={16} fill={overallRating >= n ? '#f59e0b' : 'none'} className={overallRating >= n ? 'text-amber-400' : 'text-gray-300'} />)}
                        </div>
                        <span className="text-sm font-bold text-amber-700">คะแนนรวมเฉลี่ย {overallRating}/5</span>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ความคิดเห็นเพิ่มเติม</label>
                    <textarea rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        placeholder="แนะนำสิ่งที่ควรปรับปรุง หรือสิ่งที่ประทับใจ..."
                        value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>

                {submitted ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                        <CheckCircle2 size={18} /> ขอบคุณสำหรับ Feedback ของคุณ!
                    </div>
                ) : (
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50" disabled={overallRating === 0}>
                        <Send size={16} /> ส่ง Feedback
                    </button>
                )}
            </form>

            {/* Past feedback */}
            {allFeedback.length > 0 && (
                <div>
                    <h2 className="font-bold text-gray-900 mb-4">Feedback ที่ส่งไปแล้ว</h2>
                    <div className="space-y-3">
                        {allFeedback.map((fb, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{fb.project}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{fb.date}</p>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill={fb.rating >= n ? '#f59e0b' : 'none'} className={fb.rating >= n ? 'text-amber-400' : 'text-gray-300'} />)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{fb.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
