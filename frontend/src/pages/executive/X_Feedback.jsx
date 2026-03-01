// pages/executive/X_Feedback.jsx
import React, { useState } from 'react';
import { Star, ChevronDown, MessageSquare, TrendingUp } from 'lucide-react';

const ALL_FEEDBACK = [
    { id: 1, project: 'Innovation Challenge 2026', team: 'SmartSeed', participant: 'สมชาย ว.', rating: 5, text: 'โครงการยอดเยี่ยมมากครับ ทีมงานดูแลเป็นอย่างดี กระบวนการคัดเลือกโปร่งใสและยุติธรรม', aspects: { 'การจัดการ': 5, 'การสื่อสาร': 5, 'กระบวนการ': 5, 'สิ่งอำนวยความสะดวก': 4, 'การสนับสนุน': 5 }, date: '15 ก.พ. 2569' },
    { id: 2, project: 'Innovation Challenge 2026', team: 'GreenBridge', participant: 'อรทัย แ.', rating: 5, text: 'ได้เรียนรู้มหาศาลเลยครับ อยากให้มีโครงการแบบนี้ทุกปี', aspects: { 'การจัดการ': 5, 'การสื่อสาร': 4, 'กระบวนการ': 5, 'สิ่งอำนวยความสะดวก': 5, 'การสนับสนุน': 5 }, date: '14 ก.พ. 2569' },
    { id: 3, project: 'Startup Thailand League 2026', team: 'EcoFlow', participant: 'ธีรภัทร ส.', rating: 4, text: 'โครงการดีครับ แต่อยากให้แจ้งกำหนดการล่วงหน้านานกว่านี้ และมี mentor เพิ่มขึ้นได้จะดีมาก', aspects: { 'การจัดการ': 4, 'การสื่อสาร': 3, 'กระบวนการ': 4, 'สิ่งอำนวยความสะดวก': 4, 'การสนับสนุน': 4 }, date: '1 มี.ค. 2569' },
    { id: 4, project: 'ELP Batch 5', team: 'WaveRider', participant: 'สุภาวดี ใ.', rating: 4, text: 'ได้ประสบการณ์ดีมากค่ะ workshop มีประโยชน์มาก ขอบคุณทีมงานทุกท่าน', aspects: { 'การจัดการ': 4, 'การสื่อสาร': 5, 'กระบวนการ': 4, 'สิ่งอำนวยความสะดวก': 3, 'การสนับสนุน': 4 }, date: '20 ก.พ. 2569' },
    { id: 5, project: 'ELP Batch 5', team: 'AquaFarm', participant: 'ปิยะ ว.', rating: 5, text: 'Mentor ให้คำแนะนำที่เป็นประโยชน์มาก ระบบดีและชัดเจน', aspects: { 'การจัดการ': 5, 'การสื่อสาร': 5, 'กระบวนการ': 5, 'สิ่งอำนวยความสะดวก': 5, 'การสนับสนุน': 5 }, date: '18 ก.พ. 2569' },
];

const PROJECTS_LIST = ['ทั้งหมด', ...new Set(ALL_FEEDBACK.map(f => f.project))];

function Stars({ value }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill={value >= n ? '#f59e0b' : 'none'} className={value >= n ? 'text-amber-400' : 'text-gray-200'} />)}
        </div>
    );
}

function MiniBar({ value, max = 5 }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{value}</span>
        </div>
    );
}

export default function X_Feedback() {
    const [filterProject, setFilterProject] = useState('ทั้งหมด');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const filtered = filterProject === 'ทั้งหมด' ? ALL_FEEDBACK : ALL_FEEDBACK.filter(f => f.project === filterProject);
    const avgRating = (filtered.reduce((s, f) => s + f.rating, 0) / filtered.length).toFixed(1);

    const ASPECT_KEYS = ['การจัดการ', 'การสื่อสาร', 'กระบวนการ', 'สิ่งอำนวยความสะดวก', 'การสนับสนุน'];
    const avgByAspect = ASPECT_KEYS.reduce((acc, k) => {
        acc[k] = (filtered.reduce((s, f) => s + (f.aspects[k] || 0), 0) / filtered.length).toFixed(1);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Feedback ภาพรวม</h1>
                <p className="text-gray-500 text-sm mt-1">รวบรวม feedback ของผู้เข้าร่วมจากทุกโครงการ</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-600">กรองโครงการ:</span>
                {PROJECTS_LIST.map(p => (
                    <button key={p} onClick={() => setFilterProject(p)}
                        className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${filterProject === p ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'
                            }`}>
                        {p}
                    </button>
                ))}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Overall score */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl font-bold text-amber-500 mb-2">{avgRating}</div>
                    <Stars value={Math.round(parseFloat(avgRating))} />
                    <p className="text-gray-500 text-sm mt-2">คะแนนเฉลี่ยจาก {filtered.length} ความคิดเห็น</p>
                </div>

                {/* Aspect breakdown */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> คะแนนแต่ละด้าน</h2>
                    <div className="space-y-3">
                        {ASPECT_KEYS.map(k => (
                            <div key={k} className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 font-medium w-36 shrink-0">{k}</span>
                                <div className="flex-1">
                                    <MiniBar value={parseFloat(avgByAspect[k])} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rating distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4">การกระจายคะแนน</h2>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(score => {
                        const count = filtered.filter(f => f.rating === score).length;
                        const pct = filtered.length ? (count / filtered.length) * 100 : 0;
                        return (
                            <div key={score} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12 shrink-0">
                                    <span className="text-sm font-medium text-gray-600">{score}</span>
                                    <Star size={12} fill="#f59e0b" className="text-amber-400" />
                                </div>
                                <div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Individual feedback */}
            <div>
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-amber-500" /> ความคิดเห็นทั้งหมด ({filtered.length})</h2>
                <div className="space-y-3">
                    {filtered.map(fb => (
                        <div key={fb.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedFeedback(selectedFeedback?.id === fb.id ? null : fb)}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Stars value={fb.rating} />
                                        <span className="text-sm font-bold text-gray-900">{fb.rating}/5</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{fb.participant} · {fb.team}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold">{fb.project}</span>
                                    <p className="text-[10px] text-gray-400 mt-1">{fb.date}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{fb.text}</p>

                            {selectedFeedback?.id === fb.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase">คะแนนรายด้าน</p>
                                    {ASPECT_KEYS.map(k => (
                                        <div key={k} className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-32 shrink-0">{k}</span>
                                            <MiniBar value={fb.aspects[k] || 0} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
