// pages/participant/P_Documents.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Download, Trash2, Eye, X, Upload, File, CheckCircle2, Clock } from 'lucide-react';

const STATUS_STYLE = {
    'อนุมัติแล้ว': 'bg-emerald-100 text-emerald-700',
    'รอการดำเนินการ': 'bg-amber-100 text-amber-700',
    'ร่าง': 'bg-gray-100 text-gray-500',
};

export default function P_Documents() {
    const [docs, setDocs] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [projectOptions, setProjectOptions] = useState([]);
    const [form, setForm] = useState({ name: '', project: '', fileName: '' });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const stats = useMemo(() => {
        const total = docs.length;
        const approved = docs.filter(d => d.status === 'อนุมัติแล้ว').length;
        const pending = total - approved;
        return { total, approved, pending };
    }, [docs]);

    useEffect(() => {
        const loadProjectsAndDocs = async () => {
            try {
                setLoading(true);
                setError(null);

                // ดึงรายชื่อโครงการที่ผู้ใช้เข้าร่วมจริง (เพื่อให้ upload ผ่านกติกา "Project not allowed")
                const projRes = await fetch('http://localhost:5000/api/dashboard-data/participant-data');
                if (!projRes.ok) throw new Error(`Failed to fetch projects (HTTP ${projRes.status})`);
                const projData = await projRes.json();
                const titles = (projData || []).map(p => p.title).filter(Boolean);
                setProjectOptions(titles);
                setForm((prev) => ({ ...prev, project: prev.project || titles[0] || '' }));

                // ดึงเอกสารจาก DB
                const res = await fetch('http://localhost:5000/api/participants-data/documents');
                if (!res.ok) throw new Error(`Failed to fetch documents (HTTP ${res.status})`);
                const data = await res.json();
                // Map DB -> UI shape
                setDocs((data || []).map(d => ({
                    id: d.id,
                    name: d.name,
                    project: d.project,
                    // DB ไม่มีสถานะเอกสารใน team_docs ตอนนี้ → แสดงเป็นรอการดำเนินการ
                    status: 'รอการดำเนินการ',
                    date: '—',
                    size: typeof d.size === 'number' ? formatBytes(d.size) : '—',
                    path: d.path
                })));
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        loadProjectsAndDocs();
    }, []);

    const handleAdd = (e) => {
        e.preventDefault();
        // handled by handleUpload
    };

    const handleDelete = (id) => {
        if (!window.confirm('ลบเอกสาร?')) return;
        (async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/participants-data/documents/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Delete failed (HTTP ${res.status})`);
                setDocs(prev => prev.filter(d => d.id !== id));
            } catch (e) {
                alert(e.message);
            }
        })();
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('file', file);
            fd.append('project', form.project);
            if (form.name) fd.append('name', form.name);

            const res = await fetch('http://localhost:5000/api/participants-data/documents', {
                method: 'POST',
                body: fd
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error || `Upload failed (HTTP ${res.status})`);
            }
            const d = await res.json();
            setDocs(prev => [{
                id: d.id,
                name: d.name,
                project: d.project,
                status: 'รอการดำเนินการ',
                date: 'วันนี้',
                size: typeof d.size === 'number' ? formatBytes(d.size) : '—',
                path: d.path
            }, ...prev]);

            setIsAddOpen(false);
            setForm({ name: '', project: 'Startup Thailand League 2026', fileName: '' });
            setFile(null);
        } catch (e2) {
            alert(e2.message);
        } finally {
            setSaving(false);
        }
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
                    { label: 'ทั้งหมด', value: stats.total, color: 'text-gray-900' },
                    { label: 'อนุมัติแล้ว', value: stats.approved, color: 'text-emerald-600' },
                    { label: 'รอดำเนินการ', value: stats.pending, color: 'text-amber-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Doc list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-sm text-gray-400">กำลังโหลดเอกสาร...</div>
                ) : error ? (
                    <div className="p-10 text-center text-sm text-red-500">{error}</div>
                ) : (
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
                                        <a href={`http://localhost:5000${doc.path || ''}`} target="_blank" rel="noreferrer"
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Eye size={15} />
                                        </a>
                                        <a href={`http://localhost:5000${doc.path || ''}`} download
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                            <Download size={15} />
                                        </a>
                                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[460px] shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold">อัปโหลดเอกสาร</h2>
                            <button onClick={() => setIsAddOpen(false)}><X size={22} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร</label>
                                <input type="text" placeholder="กรอกชื่อ หรือจะใช้ชื่อไฟล์ก็ได้" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ</label>
                                <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
                                    {projectOptions.length === 0 ? (
                                        <option value="">(ไม่มีโครงการที่อนุญาต)</option>
                                    ) : (
                                        projectOptions.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))
                                    )}
                                </select>
                                {projectOptions.length === 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        ระบบอัปโหลดให้ได้เฉพาะโครงการที่ทีมของคุณเข้าร่วมเท่านั้น
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ไฟล์</label>
                                <label className="block w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">{form.fileName || 'คลิกเพื่อเลือกไฟล์'}</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setFile(f);
                                            setForm({ ...form, fileName: f?.name || '' });
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">ยกเลิก</button>
                                <button
                                    type="submit"
                                    disabled={saving || !file || !form.project}
                                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'กำลังอัปโหลด...' : 'อัปโหลด'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatBytes(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return '—';
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
}
