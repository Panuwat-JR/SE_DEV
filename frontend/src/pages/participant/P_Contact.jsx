// pages/participant/P_Contact.jsx
import React, { useEffect, useState } from 'react';
import { Mail, Phone, Send, MessageSquare, Building, Loader2, AlertCircle } from 'lucide-react';
import { participantFetch, getParticipantFetchErrorMessage } from '../../lib/participantApi';

const COLORS = ['bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-teal-600'];

export default function P_Contact() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [subject, setSubject] = useState('สอบถามรายละเอียดโครงการ');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState(null);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await participantFetch('/api/participants-data/contacts');
                if (!res.ok) throw new Error('โหลดรายชื่อผู้รับผิดชอบไม่สำเร็จ');
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                const withUi = list.map((c, i) => ({
                    ...c,
                    color: COLORS[i % COLORS.length],
                }));
                setContacts(withUi);
                if (withUi.length && selectedId == null) setSelectedId(withUi[0].id);
            } catch (e) {
                setError(getParticipantFetchErrorMessage(e, 'โหลดรายชื่อผู้รับผิดชอบไม่สำเร็จ'));
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const selectedContact = contacts.find((c) => c.id === selectedId) || contacts[0];

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedContact) return;
        setSending(true);
        setSendError(null);
        try {
            const res = await participantFetch('/api/participants-data/contact-messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: selectedContact.id,
                    subject,
                    body: message.trim(),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'ส่งข้อความไม่สำเร็จ');
            setSent(true);
            setMessage('');
            setTimeout(() => setSent(false), 4000);
        } catch (err) {
            setSendError(err.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 max-w-3xl mx-auto">
                <Loader2 className="animate-spin text-emerald-500 mb-2" size={36} />
                <p className="text-gray-500 text-sm">กำลังโหลด...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 flex gap-3 text-red-700">
                <AlertCircle />
                <span>{error}</span>
            </div>
        );
    }

    if (!contacts.length) {
        return (
            <div className="max-w-3xl mx-auto space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">ติดต่อผู้รับผิดชอบ</h1>
                <p className="text-gray-500 text-sm">ยังไม่มีเจ้าหน้าที่ผูกกับโครงการของคุณในระบบ — ให้ผู้จัด map ทีมกับอีเวนต์และมอบหมายเจ้าหน้าที่</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">ติดต่อผู้รับผิดชอบ</h1>
                <p className="text-gray-500 text-sm mt-1">ส่งข้อความถึงเจ้าหน้าที่ที่ดูแลโครงการของคุณ (บันทึกในฐานข้อมูลเมื่อรัน migration แล้ว)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedContact?.id === c.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-white hover:border-emerald-200'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div
                                    className={`w-12 h-12 ${c.color} rounded-full flex items-center justify-center text-white font-bold`}
                                >
                                    {c.initial}
                                </div>
                                <div
                                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${c.online ? 'bg-emerald-500' : 'bg-gray-400'
                                        }`}
                                />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-900">{c.name}</div>
                                <div className="text-xs text-gray-500">{c.role}</div>
                            </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Building size={11} /> {c.dept}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Mail size={11} /> {c.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone size={11} /> (ดูอีเมลสำหรับติดต่อ)
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.project}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <MessageSquare size={20} className="text-emerald-600" />
                    <h2 className="font-bold text-gray-900">ส่งข้อความถึง {selectedContact?.name}</h2>
                </div>
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
                        <select
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        >
                            <option>สอบถามรายละเอียดโครงการ</option>
                            <option>แจ้งปัญหา</option>
                            <option>ขอคำแนะนำ</option>
                            <option>อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
                        <textarea
                            rows={4}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="พิมพ์ข้อความ..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    {sendError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{sendError}</div>
                    )}
                    {sent && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                            บันทึกข้อความแล้ว — เจ้าหน้าที่จะติดต่อกลับตามช่องทางที่เหมาะสม
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-60"
                        >
                            <Send size={16} /> {sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
