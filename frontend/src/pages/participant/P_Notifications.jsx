// pages/participant/P_Notifications.jsx
import React from 'react';
import { Bell, CheckCheck, Clock, FileText, Loader2 } from 'lucide-react';
import { useParticipantPortal } from '../../context/ParticipantPortalContext';

const ICON_MAP = {
    status: { Icon: Bell, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    doc: { Icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600' },
    deadline: { Icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
};

function formatNotifTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 1) return 'เมื่อสักครู่';
    if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hrs / 24);
    return `${days} วันที่แล้ว`;
}

export default function P_Notifications() {
    const { notifications, loading, error, readIds, markRead, markAllRead } = useParticipantPortal();
    const unread = notifications.filter((n) => !readIds.has(n.id)).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">การแจ้งเตือน</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {loading ? 'กำลังโหลด...' : unread > 0 ? `ยังไม่อ่าน ${unread} รายการ` : 'อ่านทั้งหมดแล้ว'}
                    </p>
                </div>
                {unread > 0 && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:underline"
                    >
                        <CheckCheck size={16} /> ทำเครื่องหมายว่าอ่านทั้งหมด
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-sm">{error}</div>
            )}

            {!loading && !error && notifications.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-500 text-sm">
                    ยังไม่มีรายการแจ้งเตือน — ข้อมูลมาจากงานในโครงการที่คุณเข้าร่วม
                </div>
            )}

            <div className="space-y-3">
                {!loading &&
                    notifications.map((n) => {
                        const meta = ICON_MAP[n.type] || ICON_MAP.status;
                        const { Icon, bg, color } = meta;
                        const isRead = readIds.has(n.id);
                        return (
                            <div
                                key={n.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => markRead(n.id)}
                                onKeyDown={(e) => e.key === 'Enter' && markRead(n.id)}
                                className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${isRead ? 'bg-white border-gray-100' : 'bg-emerald-50/60 border-emerald-200 shadow-sm'
                                    }`}
                            >
                                <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                        {!isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />}
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                            {n.project}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{formatNotifTime(n.occurredAt)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
