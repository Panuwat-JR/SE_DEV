// pages/participant/P_Notifications.jsx
import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, FileText, AlertCircle, CheckCheck } from 'lucide-react';

const ALL_NOTIFS = [
    { id: 1, type: 'status', title: 'สถานะโครงการเปลี่ยน', body: 'โครงการ "Startup Thailand League 2026" เปลี่ยนสถานะเป็น กำลังดำเนินการ', time: '2 ชั่วโมงที่แล้ว', project: 'Startup Thailand League', read: false },
    { id: 2, type: 'doc', title: 'เอกสารได้รับการอนุมัติ', body: 'เอกสาร "Pitch Deck v2.pdf" ของทีม GreenBridge ได้รับการอนุมัติโดยผู้รับผิดชอบโครงการแล้ว', time: '1 วันที่แล้ว', project: 'Startup Thailand League', read: false },
    { id: 3, type: 'deadline', title: 'ใกล้ถึงกำหนดส่ง', body: 'กำหนดส่ง "Business Model Canvas" ของทีม GreenBridge อีก 3 วัน', time: '2 วันที่แล้ว', project: 'Startup Thailand League', read: true },
    { id: 4, type: 'status', title: 'รับสมัครสำเร็จ', body: 'การสมัครเข้าร่วม "ELP Batch 5" ได้รับการยืนยันเรียบร้อยแล้ว', time: '5 วันที่แล้ว', project: 'ELP Batch 5', read: true },
    { id: 5, type: 'doc', title: 'เอกสารต้องแก้ไข', body: 'เอกสาร "แบบฟอร์มขอทุน" ต้องการการแก้ไขก่อนอนุมัติ', time: '1 สัปดาห์ที่แล้ว', project: 'ELP Batch 5', read: true },
];

const ICON_MAP = {
    status: { Icon: Bell, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    doc: { Icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    deadline: { Icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
};

export default function P_Notifications() {
    const [notifs, setNotifs] = useState(ALL_NOTIFS);

    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    const unread = notifs.filter(n => !n.read).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
                    <p className="text-gray-500 text-sm mt-1">{unread > 0 ? `ยังไม่อ่าน ${unread} รายการ` : 'อ่านทั้งหมดแล้ว'}</p>
                </div>
                {unread > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:underline">
                        <CheckCheck size={16} /> ทำเครื่องหมายว่าอ่านทั้งหมด
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifs.map(n => {
                    const { Icon, bg, color } = ICON_MAP[n.type];
                    return (
                        <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                            className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-white border-gray-100' : 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                                }`}>
                            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                    {!n.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{n.project}</span>
                                    <span className="text-[10px] text-gray-400">{n.time}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
