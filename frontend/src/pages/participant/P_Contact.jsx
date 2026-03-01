// pages/participant/P_Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, Send, MessageSquare, User, Building } from 'lucide-react';

const CONTACTS = [
    { id: 1, name: 'อ.วิไลวรรณ สุขใจ', role: 'ผู้จัดการโครงการ', project: 'Startup Thailand League 2026', email: 'wilaiwan.s@nu.ac.th', phone: '089-876-5432', initial: 'ว', color: 'bg-blue-600', dept: 'NU SEED', online: true },
    { id: 2, name: 'ดร.สมชาย พัฒนกิจ', role: 'ผู้อำนวยการ', project: 'ELP Batch 5', email: 'somchai.p@nu.ac.th', phone: '081-234-5678', initial: 'ด', color: 'bg-indigo-600', dept: 'NU SEED', online: false },
];

export default function P_Contact() {
    const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSent(true);
        setMessage('');
        setTimeout(() => setSent(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">ติดต่อผู้รับผิดชอบ</h1>
                <p className="text-gray-500 text-sm mt-1">ส่งข้อความหาผู้รับผิดชอบโครงการที่คุณสังกัด</p>
            </div>

            {/* Contact list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTACTS.map(c => (
                    <button key={c.id} onClick={() => setSelectedContact(c)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedContact.id === c.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 bg-white hover:border-emerald-200'
                            }`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className={`w-12 h-12 ${c.color} rounded-full flex items-center justify-center text-white font-bold`}>{c.initial}</div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${c.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-900">{c.name}</div>
                                <div className="text-xs text-gray-500">{c.role}</div>
                            </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5"><Building size={11} /> {c.dept}</div>
                            <div className="flex items-center gap-1.5"><Mail size={11} /> {c.email}</div>
                            <div className="flex items-center gap-1.5"><Phone size={11} /> {c.phone}</div>
                        </div>
                        <div className="mt-2">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.project}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Message form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                    <MessageSquare size={20} className="text-emerald-600" />
                    <h2 className="font-bold text-gray-900">ส่งข้อความถึง {selectedContact.name}</h2>
                </div>
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
                        <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                            <option>สอบถามรายละเอียดโครงการ</option>
                            <option>แจ้งปัญหา</option>
                            <option>ขอคำแนะนำ</option>
                            <option>อื่นๆ</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
                        <textarea rows={4} required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="พิมพ์ข้อความ..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    {sent && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                            ✅ ส่งข้อความเรียบร้อยแล้ว! ผู้รับผิดชอบจะตอบกลับในเร็วๆ นี้
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700">
                            <Send size={16} /> ส่งข้อความ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
