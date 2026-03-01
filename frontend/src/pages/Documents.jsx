import React, { useState } from 'react';
import { Search, Plus, Filter, FileText, Download, Eye, Trash2, X, Upload, File, Building2, Calendar, DollarSign, PenTool, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Documents = () => {
  const { documents, addDocument, updateDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'template'
  const [selectedTemplate, setSelectedTemplate] = useState('nia_expense'); // default template
  const [formData, setFormData] = useState({
    name: '', project: '', doc_status: 'ร่าง', type: 'ใบเบิกจ่าย (NIA)', author: 'สมชาย สมศรี', fileName: '',
    // Template specific fields
    expense_type: 'ค่าเดินทาง', amount: '', expense_date: '', description: '', agency: 'NIA'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const docName = formData.name || `ใบเบิกจ่าย_${formData.project || 'ไม่ระบุ'}`;
    addDocument({ ...formData, name: docName });
    setIsCreateOpen(false);
    setFormData({ name: '', project: '', doc_status: 'ร่าง', type: 'ใบเบิกจ่าย (NIA)', author: 'สมชาย สมศรี', fileName: '', expense_type: 'ค่าเดินทาง', amount: '', expense_date: '', description: '', agency: 'NIA' });
  };

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    if (status === 'อนุมัติแล้ว') return 'bg-emerald-100 text-emerald-700';
    if (status === 'ร่าง') return 'bg-gray-100 text-gray-600';
    if (status === 'รอการดำเนินการ') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">เอกสาร</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการเอกสารและใช้ template สำเร็จรูป</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          เอกสารทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'template' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Template
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mb-6 shrink-0">
            {[
              { label: 'เอกสารทั้งหมด', value: documents.length, color: 'text-blue-600' },
              { label: 'อนุมัติแล้ว', value: documents.filter(d => d.doc_status === 'อนุมัติแล้ว').length, color: 'text-emerald-600' },
              { label: 'รอดำเนินการ', value: documents.filter(d => d.doc_status === 'รอการดำเนินการ' || d.doc_status === 'ร่าง').length, color: 'text-amber-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="ค้นหาชื่อเอกสาร..." className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Filter size={16} /> กรองสถานะ
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 font-medium">ชื่อเอกสาร</th>
                    <th className="p-4 font-medium">ประเภท</th>
                    <th className="p-4 font-medium">โครงการ</th>
                    <th className="p-4 font-medium">ผู้สร้าง</th>
                    <th className="p-4 font-medium">สถานะ</th>
                    <th className="p-4 font-medium">วันที่</th>
                    <th className="p-4 font-medium text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={16} />
                          </div>
                          <span className="font-semibold text-gray-800">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{doc.type || 'เอกสาร'}</td>
                      <td className="p-4 text-gray-500 text-xs line-clamp-1 max-w-[160px]">{doc.project}</td>
                      <td className="p-4 text-gray-500 text-xs">{doc.author}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${getStatusColor(doc.doc_status)}`}>
                          {doc.doc_status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">{doc.date}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ดู">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="ดาวน์โหลด">
                            <Download size={16} />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ"
                            onClick={() => { if (window.confirm(`ลบเอกสาร "${doc.name}" ?`)) updateDocument(doc.id, { doc_status: 'ลบแล้ว' }); }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-400">ไม่พบเอกสาร</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Template View */
        <div className="flex gap-8 flex-1 overflow-hidden h-full">
          {/* Sidebar Templates */}
          <div className="w-1/4 flex flex-col gap-3 min-w-[250px] overflow-y-auto pr-2">
            <button onClick={() => setActiveTab('all')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors">
              &larr; กลับไปหน้าเอกสาร
            </button>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">หน่วยงานให้ทุน</div>

            <button
              onClick={() => setSelectedTemplate('nia_expense')}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${selectedTemplate === 'nia_expense' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedTemplate === 'nia_expense' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Building2 size={16} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${selectedTemplate === 'nia_expense' ? 'text-blue-900' : 'text-gray-800'}`}>ใบเบิกงบประมาณ (NIA)</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">แบบฟอร์มขออนุมัติเบิกจ่ายค่าใช้จ่ายโครงการ</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedTemplate('nia_report')}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${selectedTemplate === 'nia_report' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedTemplate === 'nia_report' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <FileText size={16} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${selectedTemplate === 'nia_report' ? 'text-blue-900' : 'text-gray-800'}`}>รายงานสรุปผล (NIA)</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">แบบฟอร์มรายงานความก้าวหน้าโครงการ</p>
              </div>
            </button>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">เอกสารทั่วไป</div>

            <button
              onClick={() => setSelectedTemplate('general_memo')}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${selectedTemplate === 'general_memo' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedTemplate === 'general_memo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <PenTool size={16} />
              </div>
              <div>
                <h3 className={`text-sm font-bold ${selectedTemplate === 'general_memo' ? 'text-blue-900' : 'text-gray-800'}`}>บันทึกข้อความ</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">หนังสือติดต่อราชการ หรือภายในองค์กร</p>
              </div>
            </button>
          </div>

          {/* Document Form Area */}
          <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative max-w-3xl">
            {/* Paper Top Decor */}
            <div className="h-6 w-full bg-[#f8fafc] border-b border-gray-200 flex justify-center items-center gap-12 shrink-0">
              <div className="w-16 h-1 rounded-full bg-gray-300"></div>
              <div className="w-16 h-1 rounded-full bg-gray-300"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <form onSubmit={handleCreate} className="max-w-xl mx-auto space-y-8">

                {/* Header Document */}
                <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 border border-gray-300">
                    ตราแผ่นดิน (Mock)
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">แบบฟอร์มเบิกจ่ายงบประมาณ</h2>
                  <p className="text-gray-600 font-medium">สำนักงานนวัตกรรมแห่งชาติ (องค์การมหาชน) - NIA</p>
                </div>

                <p className="text-sm text-gray-500 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex items-start gap-3">
                  <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  ระบุเฉพาะข้อมูลที่จำเป็น ระบบจะนำไปจัดเรียงลงในเอกสาร PDF ตามรูปแบบของหน่วยงานให้อัตโนมัติ
                </p>

                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">ชื่อโครงการ <span className="text-red-500">*</span></label>
                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="ระบุชื่อโครงการ เช่น แพลตฟอร์ม AI..."
                      value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">ประเภทค่าใช้จ่าย</label>
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        value={formData.expense_type} onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}>
                        <option value="ค่าเดินทาง">ค่าเดินทาง</option>
                        <option value="ค่าวัสดุอุปกรณ์">ค่าวัสดุอุปกรณ์</option>
                        <option value="ค่าจ้างเหมาบริการ">ค่าจ้างเหมาบริการ</option>
                        <option value="ค่าตอบแทน">ค่าตอบแทน</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">จำนวนเงิน (บาท) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><DollarSign size={16} /></span>
                        <input type="number" required min="1" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium" placeholder="0.00"
                          value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">วันที่ใช้จ่าย <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">รายละเอียดเหตุผลการเบิกจ่าย</label>
                    <textarea rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none font-medium" placeholder="อธิบายรายละเอียดกการใช้จ่ายให้ชัดเจนตามระเบียบของหน่วยงาน"
                      value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                  </div>
                </div>

                <div className="pt-8 flex justify-end gap-4 border-t border-gray-100 mt-12">
                  <button type="button" onClick={() => setActiveTab('all')} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">ยกเลิก</button>
                  <button type="submit" className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                    สร้างเอกสาร (จำลอง)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Documents;