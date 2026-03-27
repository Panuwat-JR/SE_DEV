// pages/employee/E_Documents.jsx
// รายการเอกสารจาก DB (/api/documents) — Template ยังเป็น UI แต่การบันทึกสร้างแถวจริงในระบบ
import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Download, Eye, Trash2, ChevronRight, ArrowLeft, Send, CheckCircle2, Calendar,
    LayoutTemplate, PenTool, Hash, Info, MapPin, Type, CaseSensitive, Loader2, AlertCircle, X,
} from 'lucide-react';
import { API_BASE } from '../../config/api';
import { DOCUMENTS_CHANGED_EVENT } from '../../context/AppContext';

const apiRoot = () => (API_BASE ? `${API_BASE}/api` : '/api');

const TEMPLATES = [
    { id: 'budget', name: 'ใบเบิกงบประมาณ', desc: 'แบบฟอร์มขออนุมัติเบิกจ่ายค่าใช้จ่ายโครงการ', icon: '💰', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { id: 'venue', name: 'ขอใช้สถานที่', desc: 'แบบฟอร์มขออนุญาตใช้สถานที่จัดกิจกรรม', icon: '🏛️', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'summary', name: 'รายงานสรุปโครงการ', desc: 'แบบฟอร์มสรุปผลการดำเนินโครงการ', icon: '📊', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'participant_list', name: 'รายชื่อผู้เข้าร่วม', desc: 'แบบฟอร์มรายชื่อผู้เข้าร่วมกิจกรรม', icon: '📋', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { id: 'mou', name: 'MOU / บันทึกข้อตกลง', desc: 'แบบบันทึกข้อตกลงความร่วมมือ', icon: '🤝', color: 'bg-gray-50 border-gray-200 text-gray-700' },
];

const TEMPLATE_FORMS = {
    budget: [
        { label: 'ชื่อโครงการ', type: 'text', placeholder: 'ระบุชื่อโครงการ' },
        { label: 'ประเภทค่าใช้จ่าย', type: 'select', options: ['ค่าเดินทาง', 'ค่าอาหาร', 'ค่าสถานที่', 'ค่าวัสดุ', 'อื่นๆ'] },
        { label: 'จำนวนเงิน (บาท)', type: 'number', placeholder: '0.00' },
        { label: 'วันที่ใช้จ่าย', type: 'date' },
        { label: 'รายละเอียด', type: 'textarea', placeholder: 'อธิบายรายละเอียดค่าใช้จ่าย' },
    ],
    venue: [
        { label: 'ชื่อกิจกรรม', type: 'text', placeholder: 'ระบุชื่อกิจกรรม' },
        { label: 'สถานที่ที่ต้องการ', type: 'text', placeholder: 'เช่น ห้องประชุม A อาคาร 3' },
        { label: 'วันที่ใช้งาน', type: 'date' },
        { label: 'เวลา (เริ่ม - สิ้นสุด)', type: 'text', placeholder: '09:00 - 17:00 น.' },
        { label: 'จำนวนผู้เข้าร่วม', type: 'number', placeholder: '0' },
    ],
    summary: [
        { label: 'ชื่อโครงการ', type: 'text', placeholder: 'ระบุชื่อโครงการ' },
        { label: 'วันที่จัดกิจกรรม', type: 'text', placeholder: 'วันที่ - วันที่' },
        { label: 'จำนวนผู้เข้าร่วมจริง', type: 'number', placeholder: '0' },
        { label: 'งบประมาณที่ใช้จริง (บาท)', type: 'number', placeholder: '0' },
        { label: 'สรุปผลการดำเนินงาน', type: 'textarea', placeholder: 'ระบุผลการดำเนินงาน ปัญหา และข้อเสนอแนะ' },
    ],
    participant_list: [
        { label: 'ชื่อกิจกรรม', type: 'text', placeholder: 'ระบุชื่อกิจกรรม' },
        { label: 'วันที่', type: 'date' },
        { label: 'สถานที่', type: 'text', placeholder: 'ระบุสถานที่' },
    ],
    mou: [
        { label: 'คู่สัญญาที่ 1', type: 'text', placeholder: 'มหาวิทยาลัยนเรศวร' },
        { label: 'คู่สัญญาที่ 2', type: 'text', placeholder: 'ชื่อหน่วยงาน/บริษัท' },
        { label: 'วัตถุประสงค์', type: 'textarea', placeholder: 'ระบุวัตถุประสงค์ของ MOU' },
        { label: 'ระยะเวลา', type: 'text', placeholder: '1 ปี / 3 ปี' },
    ],
};

const STATUS_COLOR = {
    อนุมัติแล้ว: 'bg-emerald-100 text-emerald-700',
    รอการดำเนินการ: 'bg-amber-100 text-amber-700',
    ร่าง: 'bg-gray-100 text-gray-500',
};

function statusBadgeClass(status) {
    if (!status) return 'bg-gray-100 text-gray-500';
    return STATUS_COLOR[status] || 'bg-gray-100 text-gray-600';
}

function normalizeDocRow(row) {
    return {
        id: row.id,
        name: row.name,
        project: row.project || '—',
        status: row.doc_status || row.status || 'ไม่ระบุ',
        date: row.date || '—',
        type: row.type || 'เอกสาร',
        file_storage_path: row.file_storage_path || null,
    };
}

export default function E_Documents() {
    const [docs, setDocs] = useState([]);
    const [events, setEvents] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [activeTab, setActiveTab] = useState('docs');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
    const [selectedEventId, setSelectedEventId] = useState('');
    const [created, setCreated] = useState(false);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [templateSubmitError, setTemplateSubmitError] = useState(null);

    const [selectedFont, setSelectedFont] = useState('Sarabun');
    const [selectedSize, setSelectedSize] = useState('16');
    const [detailDoc, setDetailDoc] = useState(null);

    const loadDocuments = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            const res = await fetch(`${apiRoot()}/documents`);
            const data = await res.json().catch(() => []);
            if (!res.ok) {
                throw new Error(data?.error || `โหลดรายการเอกสารไม่สำเร็จ (${res.status})`);
            }
            setDocs(Array.isArray(data) ? data.map(normalizeDocRow) : []);
        } catch (e) {
            setListError(
                e?.message === 'Failed to fetch' || e?.name === 'TypeError'
                    ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบ Backend และ proxy'
                    : e.message
            );
            setDocs([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    const loadEvents = useCallback(async () => {
        try {
            const res = await fetch(`${apiRoot()}/activities/events`);
            if (!res.ok) return;
            const rows = await res.json();
            setEvents(Array.isArray(rows) ? rows : []);
        } catch {
            setEvents([]);
        }
    }, []);

    useEffect(() => {
        loadDocuments();
        loadEvents();
    }, [loadDocuments, loadEvents]);

    const handleCreateFromTemplate = async (e) => {
        e.preventDefault();
        const tpl = TEMPLATES.find((t) => t.id === selectedTemplate);
        if (!tpl) return;
        const project = String(selectedProjectTitle || '').trim();
        const eid = selectedEventId ? Number(selectedEventId) : NaN;
        if (!Number.isFinite(eid) && !project) {
            setTemplateSubmitError('กรุณาเลือกโครงการจากรายการ');
            return;
        }
        setTemplateSubmitError(null);
        setSavingTemplate(true);
        try {
            const dateStamp = new Date().toISOString().slice(0, 10);
            const name = `${tpl.name}_${dateStamp}_${Date.now()}.pdf`;
            const res = await fetch(`${apiRoot()}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    project,
                    ...(Number.isFinite(eid) ? { event_id: eid } : {}),
                }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error || `บันทึกไม่สำเร็จ (${res.status})`);
            }
            await loadDocuments();
            window.dispatchEvent(new CustomEvent(DOCUMENTS_CHANGED_EVENT));
            setCreated(true);
            setTimeout(() => {
                setCreated(false);
                setSelectedTemplate(null);
                setFormValues({});
                setSelectedProjectTitle('');
                setSelectedEventId('');
                setActiveTab('docs');
            }, 2000);
        } catch (err) {
            setTemplateSubmitError(err.message);
        } finally {
            setSavingTemplate(false);
        }
    };

    const handleDeleteDocument = async (doc) => {
        if (!window.confirm(`ลบเอกสาร "${doc.name}" จากระบบถาวร?`)) return;
        try {
            const res = await fetch(`${apiRoot()}/documents/${doc.id}`, { method: 'DELETE' });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(payload.error || 'ลบไม่สำเร็จ');
                return;
            }
            await loadDocuments();
            window.dispatchEvent(new CustomEvent(DOCUMENTS_CHANGED_EVENT));
        } catch (e) {
            alert(e.message || 'ลบไม่สำเร็จ');
        }
    };

    const openTemplatePicker = () => {
        setTemplateSubmitError(null);
        setActiveTab('templates');
    };

    const backToTemplateGrid = () => {
        setSelectedTemplate(null);
        setFormValues({});
        setSelectedProjectTitle('');
        setSelectedEventId('');
        setTemplateSubmitError(null);
    };

    const downloadDocument = (doc) => {
        const url = `${apiRoot()}/documents/${encodeURIComponent(String(doc.id))}/download`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        รายการจากฐานข้อมูล — สร้างจาก Template บันทึกเป็นเอกสารจริง หากโครงการยังไม่มีงาน ระบบจะสร้างงานประกอบอัตโนมัติ
                    </p>
                </div>
            </div>

            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
                {[
                    ['docs', 'เอกสารทั้งหมด'],
                    ['templates', 'Template'],
                ].map(([tab, label]) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => {
                            setActiveTab(tab);
                            if (tab === 'templates') setTemplateSubmitError(null);
                        }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'docs' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <span className="font-bold text-gray-900">เอกสาร ({docs.length})</span>
                        <button
                            type="button"
                            onClick={openTemplatePicker}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700"
                        >
                            <Plus size={16} /> สร้างจาก Template
                        </button>
                    </div>
                    {listError && (
                        <div className="mx-5 mt-4 flex gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                            <AlertCircle className="shrink-0" size={18} aria-hidden />
                            <span>{listError}</span>
                        </div>
                    )}
                    {listLoading ? (
                        <div className="flex items-center justify-center gap-2 py-20 text-gray-500 text-sm">
                            <Loader2 className="animate-spin" size={20} />
                            กำลังโหลดรายการเอกสาร...
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                                    <th className="px-5 py-3 text-left">ชื่อเอกสาร</th>
                                    <th className="px-5 py-3 text-left">โครงการ</th>
                                    <th className="px-5 py-3">สถานะ</th>
                                    <th className="px-5 py-3">วันที่</th>
                                    <th className="px-5 py-3 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {docs.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="hover:bg-gray-50/30 transition-colors"
                                        onClick={(e) => {
                                            if (e.target.closest('button')) return;
                                            setDetailDoc((d) => (d?.id === doc.id ? null : doc));
                                        }}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                    <FileText size={15} />
                                                </div>
                                                <div className="font-semibold text-gray-800 text-sm">{doc.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-gray-500">{doc.project}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusBadgeClass(doc.status)}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-center text-gray-400">{doc.date}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailDoc((d) => (d?.id === doc.id ? null : doc));
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-colors ${
                                                        detailDoc?.id === doc.id
                                                            ? 'text-blue-600 bg-blue-50'
                                                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                    title={
                                                        detailDoc?.id === doc.id
                                                            ? 'คลิกอีกครั้งเพื่อปิดรายละเอียด'
                                                            : 'ดูรายละเอียดเอกสาร'
                                                    }
                                                    aria-expanded={detailDoc?.id === doc.id}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadDocument(doc);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="ดาวน์โหลด (ไฟล์สรุปจากระบบ หรือลิงก์ถ้ามีใน storage)"
                                                >
                                                    <Download size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDocument(doc);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="ลบเอกสารจากระบบ"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!listLoading && !listError && docs.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-16">ยังไม่มีเอกสารในระบบ</p>
                    )}
                </div>
            )}

            {activeTab === 'templates' && !selectedTemplate && (
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">เลือกแบบฟอร์มเอกสาร</h2>
                        <p className="text-gray-500 text-sm mt-1">หลังกรอกแบบฟอร์ม ระบบจะสร้างแถวเอกสารใน DB ตามโครงการที่เลือก</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TEMPLATES.map((tpl) => (
                            <button
                                key={tpl.id}
                                type="button"
                                onClick={() => {
                                    setSelectedTemplate(tpl.id);
                                    setTemplateSubmitError(null);
                                }}
                                className="text-left p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 bg-white transition-all group relative overflow-hidden flex flex-col h-full"
                            >
                                <div
                                    aria-hidden
                                    className={`pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 opacity-30 ${tpl.color.split(' ')[0]}`}
                                />

                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm bg-white border ${tpl.color.split(' ')[1]}`}
                                >
                                    {tpl.icon}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2 truncate relative z-10 text-lg">{tpl.name}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-1 relative z-10 leading-loose max-w-[90%]">{tpl.desc}</p>

                                <div
                                    className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl mt-auto w-fit transition-all border ${tpl.color}`}
                                >
                                    ใช้แม่แบบนี้ <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && selectedTemplate && (
                <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
                    <button
                        type="button"
                        onClick={backToTemplateGrid}
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors w-fit px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md"
                    >
                        <ArrowLeft size={16} /> ย้อนกลับไปเลือกแบบฟอร์มอื่น
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 p-8 relative overflow-hidden">
                            <div className="pointer-events-none absolute -top-10 -right-10 p-8 opacity-[0.03] rotate-12">
                                <LayoutTemplate size={200} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${TEMPLATES.find((t) => t.id === selectedTemplate)?.color}`}
                                        >
                                            <span className="text-3xl">{TEMPLATES.find((t) => t.id === selectedTemplate)?.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{TEMPLATES.find((t) => t.id === selectedTemplate)?.name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">{TEMPLATES.find((t) => t.id === selectedTemplate)?.desc}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 self-start sm:self-auto">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <Type size={14} className="text-gray-400" />
                                            <select
                                                className="text-xs font-medium text-gray-700 outline-none bg-transparent cursor-pointer w-20"
                                                value={selectedFont}
                                                onChange={(e) => setSelectedFont(e.target.value)}
                                            >
                                                <option value="Sarabun">Sarabun</option>
                                                <option value="TH Niramit">TH Niramit</option>
                                                <option value="Kanit">Kanit</option>
                                                <option value="Prompt">Prompt</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <CaseSensitive size={14} className="text-gray-400" />
                                            <select
                                                className="text-xs font-medium text-gray-700 outline-none bg-transparent cursor-pointer"
                                                value={selectedSize}
                                                onChange={(e) => setSelectedSize(e.target.value)}
                                            >
                                                <option value="12">12 pt</option>
                                                <option value="14">14 pt</option>
                                                <option value="16">16 pt</option>
                                                <option value="18">18 pt</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-6 border-gray-100" />

                                {templateSubmitError && (
                                    <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                        <AlertCircle className="shrink-0" size={18} />
                                        {templateSubmitError}
                                    </div>
                                )}

                                {created ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-lg">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">บันทึกลงระบบแล้ว</h3>
                                        <p className="text-gray-500 text-sm">สร้างเอกสารใน DB สำเร็จ — กลับไปแท็บรายการอัตโนมัติ</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateFromTemplate} className="space-y-5">
                                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                                            <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                <Info size={14} className="text-blue-600" />
                                                โครงการ (เลือกจากรายการ — ใช้รหัสโครงการผูกกับฐานข้อมูล)
                                            </label>
                                            <select
                                                required
                                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                value={selectedEventId}
                                                onChange={(e) => {
                                                    const vid = e.target.value;
                                                    setSelectedEventId(vid);
                                                    const ev = events.find((x) => String(x.event_id) === vid);
                                                    setSelectedProjectTitle(ev?.title || '');
                                                }}
                                            >
                                                <option value="">-- เลือกโครงการ --</option>
                                                {events.map((ev) => (
                                                    <option key={ev.event_id ?? ev.id} value={String(ev.event_id ?? ev.id)}>
                                                        {ev.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {events.length === 0 && (
                                                <p className="text-xs text-amber-700">ไม่พบรายการโครงการ — สร้างกิจกรรมในระบบก่อน</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {(TEMPLATE_FORMS[selectedTemplate] || []).map((field) => (
                                                <div
                                                    key={field.label}
                                                    className={field.type === 'textarea' || (field.type === 'text' && field.label.includes('ชื่อ')) ? 'md:col-span-2' : ''}
                                                >
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                                        {field.type === 'date' && <Calendar size={14} className="text-blue-500" />}
                                                        {field.type === 'number' && <Hash size={14} className="text-blue-500" />}
                                                        {field.label.includes('สถานที่') && <MapPin size={14} className="text-blue-500" />}
                                                        {field.type === 'textarea' && <PenTool size={14} className="text-blue-500" />}
                                                        {!['date', 'number', 'textarea'].includes(field.type) && !field.label.includes('สถานที่') && (
                                                            <Info size={14} className="text-blue-500" />
                                                        )}
                                                        {field.label}
                                                        <span className="text-[10px] font-normal text-gray-400">(อ้างอิงเท่านั้น)</span>
                                                    </label>
                                                    {field.type === 'textarea' ? (
                                                        <textarea
                                                            rows={3}
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-sm placeholder:text-gray-400"
                                                            placeholder={field.placeholder}
                                                            value={formValues[field.label] || ''}
                                                            onChange={(e) => setFormValues((v) => ({ ...v, [field.label]: e.target.value }))}
                                                        />
                                                    ) : field.type === 'select' ? (
                                                        <select
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm text-gray-700"
                                                            value={formValues[field.label] || field.options[0]}
                                                            onChange={(e) => setFormValues((v) => ({ ...v, [field.label]: e.target.value }))}
                                                        >
                                                            {field.options.map((o) => (
                                                                <option key={o} value={o}>
                                                                    {o}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            placeholder={field.placeholder}
                                                            value={formValues[field.label] || ''}
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-gray-400"
                                                            onChange={(e) => setFormValues((v) => ({ ...v, [field.label]: e.target.value }))}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={backToTemplateGrid}
                                                className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={savingTemplate || events.length === 0}
                                                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                {savingTemplate ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                                บันทึกลงระบบ
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2 hidden lg:flex flex-col">
                            <div className="flex-1 bg-gray-100/70 rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    LIVE PREVIEW
                                </div>
                                <div className="w-[85%] aspect-[1/1.4] bg-white shadow-xl border border-gray-100 p-7 flex flex-col gap-5 mx-auto rounded-sm transform rotate-2 hover:rotate-0 transition-all duration-500 group">
                                    <div className="w-1/3 h-2.5 bg-gray-200 rounded-full mx-auto mb-2 group-hover:bg-gray-300 transition-colors" />
                                    <div className="w-3/4 h-5 bg-blue-50/80 rounded-full mb-4 relative overflow-hidden">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-500"
                                            style={{
                                                width: `${(Object.values(formValues).filter(Boolean).length / (TEMPLATE_FORMS[selectedTemplate]?.length || 1)) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    {(TEMPLATE_FORMS[selectedTemplate] || []).map((field, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-16 h-2 bg-gray-100 rounded-full" />
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${formValues[field.label] ? 'bg-blue-400 w-1/2 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-gray-50 w-full'}`}
                                                />
                                            </div>
                                            {field.type === 'textarea' && (
                                                <div className="pl-[76px] space-y-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 delay-75 ${formValues[field.label] ? 'bg-blue-200 w-3/4' : 'bg-gray-50 w-full'}`}
                                                    />
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 delay-150 ${formValues[field.label] ? 'bg-blue-200 w-1/2' : 'bg-gray-50 w-2/3'}`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="mt-auto flex justify-between items-end pt-8 opacity-60">
                                        <div className="w-16 h-16 bg-red-50 rounded-full border-2 border-red-200 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform">
                                            <div className="w-10 h-1.5 bg-red-200 rounded-full" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-center">
                                            <div className="w-24 h-0.5 bg-gray-300" />
                                            <div className="w-14 h-1.5 bg-gray-100 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {detailDoc && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    role="presentation"
                    onClick={() => setDetailDoc(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="doc-detail-title"
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <FileText size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h3 id="doc-detail-title" className="font-bold text-gray-900 text-lg break-words">
                                        {detailDoc.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {detailDoc.file_storage_path
                                            ? 'มี path ไฟล์ในระบบ — ใช้ปุ่มดาวน์โหลดเพื่อเปิดหรือรับไฟล์'
                                            : 'รายการจากฐานข้อมูล — ดาวน์โหลดจะได้ไฟล์ข้อความสรุปจากระบบ'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailDoc(null)}
                                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                aria-label="ปิด"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <dl className="space-y-3 text-sm border-t border-gray-100 pt-4">
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-500">โครงการ</dt>
                                <dd className="font-medium text-gray-900 text-right">{detailDoc.project}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-500">สถานะ</dt>
                                <dd>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusBadgeClass(detailDoc.status)}`}>
                                        {detailDoc.status}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-500">วันที่</dt>
                                <dd className="font-medium text-gray-900">{detailDoc.date}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-500">ประเภท</dt>
                                <dd className="font-medium text-gray-900">{detailDoc.type}</dd>
                            </div>
                        </dl>
                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => downloadDocument(detailDoc)}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                            >
                                ดาวน์โหลด
                            </button>
                            <button
                                type="button"
                                onClick={() => setDetailDoc(null)}
                                className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
