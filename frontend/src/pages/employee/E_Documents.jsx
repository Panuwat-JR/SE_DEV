// pages/employee/E_Documents.jsx
// เอกสารพร้อม Template ต้นแบบ
import React, { useState } from 'react';
import { FileText, Plus, Download, Eye, Trash2, X, ChevronRight, File, ArrowLeft, Send, CheckCircle2, Calendar, LayoutTemplate, PenTool, Hash, Info, MapPin, Type, CaseSensitive } from 'lucide-react';

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

    // Font and Size settings
    const [selectedFont, setSelectedFont] = useState('Sarabun');
    const [selectedSize, setSelectedSize] = useState('16');

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
                <div className="animate-in fade-in duration-300">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">เลือกแบบฟอร์มเอกสาร</h2>
                        <p className="text-gray-500 text-sm mt-1">เริ่มต้นสร้างเอกสารใหม่ได้อย่างรวดเร็วจากแบบฟอร์มมาตรฐาน</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TEMPLATES.map(tpl => (
                            <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                                className="text-left p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 bg-white transition-all group relative overflow-hidden flex flex-col h-full">
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 opacity-30 ${tpl.color.split(' ')[0]}`}></div>

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-sm bg-white border ${tpl.color.split(' ')[1]}`}>
                                    {tpl.icon}
                                </div>

                                <h3 className="font-bold text-gray-900 mb-2 truncate relative z-10 text-lg">{tpl.name}</h3>
                                <p className="text-sm text-gray-500 mb-6 flex-1 relative z-10 leading-loose max-w-[90%]">{tpl.desc}</p>

                                <div className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl mt-auto w-fit transition-all border ${tpl.color}`}>
                                    ใช้แม่แบบนี้ <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && selectedTemplate && (
                <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
                    <button onClick={() => { setSelectedTemplate(null); setFormValues({}); }} className="text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 transition-colors w-fit px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md">
                        <ArrowLeft size={16} /> ย้อนกลับไปเลือกแบบฟอร์มอื่น
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 p-8 relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none rotate-12">
                                <LayoutTemplate size={200} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${TEMPLATES.find(t => t.id === selectedTemplate)?.color}`}>
                                            <span className="text-3xl">{TEMPLATES.find(t => t.id === selectedTemplate)?.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">{TEMPLATES.find(t => t.id === selectedTemplate)?.desc}</p>
                                        </div>
                                    </div>

                                    {/* Document Settings */}
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

                                {created ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 border-4 border-white shadow-lg">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">สร้างเอกสารเรียบร้อย!</h3>
                                        <p className="text-gray-500 text-sm">พิมพ์เอกสารสำเร็จ และถูกบันทึกเป็นฉบับร่างแล้วในระบบ</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateFromTemplate} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {(TEMPLATE_FORMS[selectedTemplate] || []).map((field, idx) => (
                                                <div key={field.label} className={field.type === 'textarea' || (field.type === 'text' && field.label.includes('ชื่อ')) ? 'md:col-span-2' : ''}>
                                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                                        {field.type === 'date' && <Calendar size={14} className="text-blue-500" />}
                                                        {field.type === 'number' && <Hash size={14} className="text-blue-500" />}
                                                        {field.label.includes('สถานที่') && <MapPin size={14} className="text-blue-500" />}
                                                        {field.type === 'textarea' && <PenTool size={14} className="text-blue-500" />}
                                                        {!['date', 'number', 'textarea'].includes(field.type) && !field.label.includes('สถานที่') && <Info size={14} className="text-blue-500" />}
                                                        {field.label}
                                                    </label>
                                                    {field.type === 'textarea' ? (
                                                        <textarea rows={3} className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none shadow-sm placeholder:text-gray-400"
                                                            placeholder={field.placeholder}
                                                            value={formValues[field.label] || ''}
                                                            onChange={(e) => setFormValues(v => ({ ...v, [field.label]: e.target.value }))} />
                                                    ) : field.type === 'select' ? (
                                                        <select className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm text-gray-700"
                                                            value={formValues[field.label] || field.options[0]}
                                                            onChange={(e) => setFormValues(v => ({ ...v, [field.label]: e.target.value }))}>
                                                            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input type={field.type} placeholder={field.placeholder}
                                                            value={formValues[field.label] || ''}
                                                            className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm placeholder:text-gray-400"
                                                            onChange={(e) => setFormValues(v => ({ ...v, [field.label]: e.target.value }))} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                            <button type="button" onClick={() => { setSelectedTemplate(null); setFormValues({}); }} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">ยกเลิก</button>
                                            <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all">
                                                <Send size={16} /> สร้างเอกสารเลย
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="lg:col-span-2 hidden lg:flex flex-col">
                            <div className="flex-1 bg-gray-100/70 rounded-3xl border border-gray-200 p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-[10px] font-bold text-gray-500 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    LIVE PREVIEW
                                </div>
                                <div className="w-[85%] aspect-[1/1.4] bg-white shadow-xl border border-gray-100 p-7 flex flex-col gap-5 mx-auto rounded-sm transform rotate-2 hover:rotate-0 transition-all duration-500 group">
                                    <div className="w-1/3 h-2.5 bg-gray-200 rounded-full mx-auto mb-2 group-hover:bg-gray-300 transition-colors"></div>
                                    <div className="w-3/4 h-5 bg-blue-50/80 rounded-full mb-4 relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-500" style={{ width: (Object.values(formValues).filter(Boolean).length / (TEMPLATE_FORMS[selectedTemplate]?.length || 1)) * 100 + '%' }}></div>
                                    </div>

                                    {(TEMPLATE_FORMS[selectedTemplate] || []).map((field, i) => (
                                        <div key={i} className="flex flex-col gap-2">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                                                <div className={`h-2 rounded-full transition-all duration-300 ${formValues[field.label] ? 'bg-blue-400 w-1/2 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-gray-50 w-full'}`}></div>
                                            </div>
                                            {field.type === 'textarea' && (
                                                <div className="pl-[76px] space-y-2">
                                                    <div className={`h-2 rounded-full transition-all duration-300 delay-75 ${formValues[field.label] ? 'bg-blue-200 w-3/4' : 'bg-gray-50 w-full'}`}></div>
                                                    <div className={`h-2 rounded-full transition-all duration-300 delay-150 ${formValues[field.label] ? 'bg-blue-200 w-1/2' : 'bg-gray-50 w-2/3'}`}></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="mt-auto flex justify-between items-end pt-8 opacity-60">
                                        <div className="w-16 h-16 bg-red-50 rounded-full border-2 border-red-200 flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform">
                                            <div className="w-10 h-1.5 bg-red-200 rounded-full"></div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-center">
                                            <div className="w-24 h-0.5 bg-gray-300"></div>
                                            <div className="w-14 h-1.5 bg-gray-100 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
