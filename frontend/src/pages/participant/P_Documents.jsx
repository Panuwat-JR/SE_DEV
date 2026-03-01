// pages/participant/P_Documents.jsx
import React, { useState } from 'react';
import { FileText, Plus, Download, Trash2, Eye, X, Upload, File, CheckCircle2, Clock } from 'lucide-react';

const INIT_DOCS = [
    { id: 1, name: 'Pitch_Deck_GreenBridge_v1.pdf', project: 'Startup Thailand League 2026', status: 'อนุมัติแล้ว', date: '20 ก.พ. 2569', size: '2.4 MB' },
    { id: 2, name: 'Business_Model_Canvas.pdf', project: 'Startup Thailand League 2026', status: 'อนุมัติแล้ว', date: '18 ก.พ. 2569', size: '1.1 MB' },
    { id: 3, name: 'Financial_Plan_2026.xlsx', project: 'Startup Thailand League 2026', status: 'รอการดำเนินการ', date: '22 ก.พ. 2569', size: '1.8 MB' },
    { id: 4, name: 'Team_Profile.pdf', project: 'Startup Thailand League 2026', status: 'ร่าง', date: '25 ก.พ. 2569', size: '0.8 MB' },
    { id: 5, name: 'ใบสมัคร_ELP_Batch5.pdf', project: 'ELP Batch 5', status: 'รอการดำเนินการ', date: '1 มี.ค. 2569', size: '0.3 MB' },
];

const STATUS_STYLE = {
    'อนุมัติแล้ว': 'bg-emerald-100 text-emerald-700',
    'รอการดำเนินการ': 'bg-amber-100 text-amber-700',
    'ร่าง': 'bg-gray-100 text-gray-500',
};

export default function P_Documents() {
    const [docs, setDocs] = useState(INIT_DOCS);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [form, setForm] = useState({ name: '', project: 'Startup Thailand League 2026', fileName: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        setDocs(prev => [...prev, {
            id: Date.now(), name: form.name || form.fileName || 'เอกสารใหม่',
            project: form.project, status: 'ร่าง', date: 'วันนี้', size: '—',
        }]);
        setIsAddOpen(false);
        setForm({ name: '', project: 'Startup Thailand League 2026', fileName: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('ลบเอกสาร?')) setDocs(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
                    <p className="text-gray-500 text-sm mt-1">เอกสารทั้งหมดในโครงการที่คุณเข้าร่วม</p>
                </div>
                <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700">
                    <Plus size={18} /> อัปโหลดเอกสาร
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'ทั้งหมด', value: docs.length, color: 'text-gray-900' },
                    { label: 'อนุมัติแล้ว', value: docs.filter(d => d.status === 'อนุมัติแล้ว').length, color: 'text-emerald-600' },
                    { label: 'รอดำเนินการ', value: docs.filter(d => d.status !== 'อนุมัติแล้ว').length, color: 'text-amber-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Doc list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase">
                            <th className="px-5 py-3.5">ชื่อเอกสาร</th>
                            <th className="px-5 py-3.5">โครงการ</th>
                            <th className="px-5 py-3.5">สถานะ</th>
                            <th className="px-5 py-3.5">วันที่</th>
                            <th className="px-5 py-3.5 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {docs.map(doc => (
                            <tr key={doc.id} className="hover:bg-gray-50/30">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText size={15} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800 text-sm">{doc.name}</div>
                                            <div className="text-[10px] text-gray-400">{doc.size}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-xs text-gray-500">{doc.project}</td>
                                <td className="px-5 py-4">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${STATUS_STYLE[doc.status]}`}>{doc.status}</span>
                                </td>
                                <td className="px-5 py-4 text-xs text-gray-400">{doc.date}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={15} /></button>
                                        <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={15} /></button>
                                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[460px] shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold">อัปโหลดเอกสาร</h2>
                            <button onClick={() => setIsAddOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร</label>
                                <input type="text" placeholder="กรอกชื่อ หรือจะใช้ชื่อไฟล์ก็ได้" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                                    <option>Startup Thailand League 2026</option>
                                    <option>ELP Batch 5</option>
                                    <option>Innovation Challenge 2026</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ไฟล์</label>
                                <label className="block w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">{form.fileName || 'คลิกเพื่อเลือกไฟล์'}</span>
                                    <input type="file" className="sr-only" onChange={(e) => setForm({ ...form, fileName: e.target.files[0]?.name || '' })} />
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">ยกเลิก</button>
                                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700">อัปโหลด</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
