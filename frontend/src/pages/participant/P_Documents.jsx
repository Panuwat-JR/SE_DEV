// pages/participant/P_Documents.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, Download, Eye, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { participantFetch } from '../../lib/participantApi';

const STATUS_STYLE = {
    อนุมัติแล้ว: 'bg-emerald-100 text-emerald-700',
    รอการดำเนินการ: 'bg-amber-100 text-amber-700',
    ร่าง: 'bg-gray-100 text-gray-500',
    pending_approval: 'bg-amber-100 text-amber-700',
};

function statusClass(status) {
    if (!status) return 'bg-gray-100 text-gray-500';
    return STATUS_STYLE[status] || 'bg-gray-100 text-gray-600';
}

export default function P_Documents() {
    const [docs, setDocs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({ name: '', eventId: '', fileName: '', fileSize: null });
    const [saving, setSaving] = useState(false);

    const stats = useMemo(() => {
        const approved = docs.filter((d) => String(d.status).includes('อนุมัติ')).length;
        return {
            total: docs.length,
            approved,
            pending: docs.length - approved,
        };
    }, [docs]);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const [dRes, pRes] = await Promise.all([
                participantFetch('/api/participants-data/documents'),
                participantFetch('/api/participants-data/dashboard'),
            ]);
            if (!dRes.ok) {
                const errData = await dRes.json().catch(() => ({}));
                throw new Error(errData.error || `โหลดเอกสารไม่สำเร็จ (${dRes.status})`);
            }
            if (!pRes.ok) {
                const errData = await pRes.json().catch(() => ({}));
                throw new Error(errData.error || `โหลดรายการโครงการไม่สำเร็จ (${pRes.status})`);
            }
            const dJson = await dRes.json();
            const pJson = await pRes.json();
            setDocs(Array.isArray(dJson) ? dJson : []);
            setProjects(Array.isArray(pJson) ? pJson : []);
            setForm((f) => {
                if (!pJson?.length || f.eventId) return f;
                return { ...f, eventId: String(pJson[0].id) };
            });
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const eventId = Number(form.eventId);
        if (!eventId) return;
        try {
            setSaving(true);
            const res = await participantFetch('/api/participants-data/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name || form.fileName || 'เอกสารใหม่',
                    eventId,
                    fileName: form.fileName || null,
                    fileSize: form.fileSize,
                }),
            });
            const errData = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(errData.error || 'บันทึกไม่สำเร็จ');
            setIsAddOpen(false);
            setForm((f) => ({ ...f, name: '', fileName: '', fileSize: null }));
            await load();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const openDownload = (doc) => {
        const path = doc.filePath;
        if (!path) {
            alert('ยังไม่มีไฟล์ในระบบสำหรับเอกสารนี้ (บันทึกเฉพาะรายการ)');
            return;
        }
        if (path.startsWith('http://') || path.startsWith('https://')) {
            window.open(path, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open(`${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
                    <p className="text-gray-500 text-sm mt-1">เอกสารที่ผูกกับงานในโครงการที่คุณเข้าร่วม</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700"
                >
                    <Plus size={18} /> ลงทะเบียนเอกสาร
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-8 flex items-center gap-3 text-slate-700 shadow-sm">
                    <AlertCircle className="shrink-0 text-slate-500" size={22} aria-hidden />
                    <span>{error}</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'ทั้งหมด', value: stats.total, color: 'text-gray-900' },
                            { label: 'อนุมัติแล้ว', value: stats.approved, color: 'text-emerald-600' },
                            { label: 'รอดำเนินการ/อื่นๆ', value: stats.pending, color: 'text-amber-600' },
                        ].map((s) => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

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
                                {docs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-gray-500 text-sm">
                                            ยังไม่มีเอกสาร — ลงทะเบียนเอกสารใหม่ หรือรอให้ผู้จัดผูกเอกสารกับงานในระบบ
                                        </td>
                                    </tr>
                                ) : (
                                    docs.map((doc) => (
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
                                                <span
                                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusClass(doc.status)}`}
                                                >
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-gray-400">{doc.date}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="ดูรายละเอียด"
                                                        onClick={() => setPreview(doc)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="ดาวน์โหลด"
                                                        onClick={() => openDownload(doc)}
                                                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    >
                                                        <Download size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {preview && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <h2 className="text-lg font-bold pr-4">{preview.name}</h2>
                            <button type="button" onClick={() => setPreview(null)} className="shrink-0 text-gray-400 hover:text-gray-600">
                                <X size={22} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">โครงการ:</span> {preview.project}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">สถานะ:</span> {preview.status}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">วันที่:</span> {preview.date}
                        </p>
                        <p className="text-xs text-gray-400 break-all">
                            <span className="font-semibold text-gray-600">ที่เก็บไฟล์:</span> {preview.filePath || '—'}
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setPreview(null)}
                                className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700"
                            >
                                ปิด
                            </button>
                            <button
                                type="button"
                                onClick={() => openDownload(preview)}
                                className="px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white font-bold"
                            >
                                เปิด/ดาวน์โหลด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[460px] shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold">ลงทะเบียนเอกสาร</h2>
                            <button type="button" onClick={() => setIsAddOpen(false)}>
                                <X size={22} className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร</label>
                                <input
                                    type="text"
                                    placeholder="กรอกชื่อ หรือใช้ชื่อไฟล์"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={form.eventId}
                                    onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                                >
                                    {projects.length === 0 ? (
                                        <option value="">ไม่มีโครงการ</option>
                                    ) : (
                                        projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title}
                                            </option>
                                        ))
                                    )}
                                </select>
                                {projects.length === 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        ระบบให้ลงทะเบียนได้เฉพาะโครงการที่ทีมของคุณเข้าร่วม
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ไฟล์ (อ้างอิง)</label>
                                <label className="block w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">{form.fileName || 'คลิกเพื่อเลือกไฟล์ (metadata)'}</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        onChange={(ev) => {
                                            const f = ev.target.files?.[0];
                                            setForm({
                                                ...form,
                                                fileName: f?.name || '',
                                                fileSize: f?.size ?? null,
                                            });
                                        }}
                                    />
                                </label>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    โหมดสาธิต: บันทึกชื่อและขนาดไฟล์ — ยังไม่อัปโหลด binary ไปเซิร์ฟเวอร์
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !form.eventId}
                                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
