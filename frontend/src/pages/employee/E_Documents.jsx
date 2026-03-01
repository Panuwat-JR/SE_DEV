// pages/employee/E_Documents.jsx
// เอกสารพร้อม Template ต้นแบบ
import React, { useState } from 'react';
import { FileText, Plus, Download, Eye, Trash2, X, ChevronRight, File } from 'lucide-react';

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

const INIT_DOCS = [
    { id: 1, name: 'ใบเบิกค่าเดินทาง_ELP.pdf', project: 'ELP Batch 5', status: 'อนุมัติแล้ว', template: 'budget', date: '20 ก.พ. 2569' },
    { id: 2, name: 'ขอใช้ห้องประชุม_Demo.docx', project: 'NU Startup Demo Day', status: 'รอการดำเนินการ', template: 'venue', date: '25 ก.พ. 2569' },
    { id: 3, name: 'รายงานสรุป_Innovation2026.pdf', project: 'Innovation Challenge 2026', status: 'อนุมัติแล้ว', template: 'summary', date: '10 ก.พ. 2569' },
];

const STATUS_COLOR = {
    'อนุมัติแล้ว': 'bg-emerald-100 text-emerald-700',
    'รอการดำเนินการ': 'bg-amber-100 text-amber-700',
    'ร่าง': 'bg-gray-100 text-gray-500',
};

export default function E_Documents() {
    const [docs, setDocs] = useState(INIT_DOCS);
    const [activeTab, setActiveTab] = useState('docs');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [created, setCreated] = useState(false);

    const handleCreateFromTemplate = (e) => {
        e.preventDefault();
        const tpl = TEMPLATES.find(t => t.id === selectedTemplate);
        setDocs(prev => [...prev, {
            id: Date.now(),
            name: `${tpl.name}_${new Date().toLocaleDateString('th')}.pdf`,
            project: formValues['ชื่อโครงการ'] || formValues['ชื่อกิจกรรม'] || 'ไม่ระบุ',
            status: 'ร่าง', template: selectedTemplate, date: 'วันนี้',
        }]);
        setCreated(true);
        setTimeout(() => { setCreated(false); setSelectedTemplate(null); setFormValues({}); setActiveTab('docs'); }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
                    <p className="text-gray-500 text-sm mt-1">จัดการเอกสารและใช้ template สำเร็จรูป</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
                {[['docs', 'เอกสารทั้งหมด'], ['templates', 'Template']].map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'docs' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <span className="font-bold text-gray-900">เอกสาร ({docs.length})</span>
                        <button onClick={() => setActiveTab('templates')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                            <Plus size={16} /> สร้างจาก Template
                        </button>
                    </div>
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
                            {docs.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50/30 transition-colors">
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
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${STATUS_COLOR[doc.status]}`}>{doc.status}</span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-center text-gray-400">{doc.date}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={15} /></button>
                                            <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={15} /></button>
                                            <button onClick={() => setDocs(p => p.filter(d => d.id !== doc.id))} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'templates' && !selectedTemplate && (
                <div>
                    <h2 className="font-bold text-gray-900 mb-4">เลือก Template เอกสาร</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TEMPLATES.map(tpl => (
                            <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                                className={`text-left p-5 rounded-2xl border-2 ${tpl.color} hover:shadow-md transition-all group`}>
                                <div className="text-3xl mb-3">{tpl.icon}</div>
                                <div className="font-bold text-gray-900 mb-1">{tpl.name}</div>
                                <div className="text-xs text-gray-500 mb-3">{tpl.desc}</div>
                                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                                    ใช้ template นี้ <ChevronRight size={14} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && selectedTemplate && (
                <div className="max-w-xl">
                    <button onClick={() => setSelectedTemplate(null)} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
                        ← เลือก Template อื่น
                    </button>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-1">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</h2>
                        <p className="text-xs text-gray-500 mb-5">{TEMPLATES.find(t => t.id === selectedTemplate)?.desc}</p>
                        {created ? (
                            <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium">
                                ✅ สร้างเอกสารเรียบร้อย! ไปที่แท็บ "เอกสารทั้งหมด"
                            </div>
                        ) : (
                            <form onSubmit={handleCreateFromTemplate} className="space-y-4">
                                {(TEMPLATE_FORMS[selectedTemplate] || []).map((field) => (
                                    <div key={field.label}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                placeholder={field.placeholder}
                                                onChange={(e) => setFormValues(v => ({ ...v, [field.label]: e.target.value }))} />
                                        ) : field.type === 'select' ? (
                                            <select className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                                {field.options.map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => setFormValues(v => ({ ...v, [field.label]: e.target.value }))} />
                                        )}
                                    </div>
                                ))}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setSelectedTemplate(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl">ยกเลิก</button>
                                    <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700">สร้างเอกสาร</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
