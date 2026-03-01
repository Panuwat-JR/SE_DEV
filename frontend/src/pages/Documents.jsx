import React, { useState } from 'react';
import { Search, Plus, Filter, FileText, Download, Eye, Trash2, X, Upload, File } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Documents = () => {
  const { documents, addDocument, updateDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', project: '', doc_status: 'ร่าง', type: 'เอกสาร', author: 'สมชาย สมศรี', fileName: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    addDocument({ ...formData });
    setIsCreateOpen(false);
    setFormData({ name: '', project: '', doc_status: 'ร่าง', type: 'เอกสาร', author: 'สมชาย สมศรี', fileName: '' });
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
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">เอกสาร</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการเอกสารและไฟล์แนบของโครงการ</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
          <Plus size={18} /> เพิ่มเอกสาร
        </button>
      </div>

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

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">เพิ่มเอกสาร</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเอกสาร *</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น รายงานสรุปผล..."
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="รายงาน">รายงาน</option>
                    <option value="บันทึกข้อความ">บันทึกข้อความ</option>
                    <option value="สัญญา">สัญญา</option>
                    <option value="ใบเบิก">ใบเบิก</option>
                    <option value="แบบประเมิน">แบบประเมิน</option>
                    <option value="เอกสาร">เอกสาร</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.doc_status} onChange={(e) => setFormData({ ...formData, doc_status: e.target.value })}>
                    <option value="ร่าง">ร่าง</option>
                    <option value="รอการดำเนินการ">รอการดำเนินการ</option>
                    <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โครงการ</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="ชื่อโครงการ"
                  value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อัปโหลดไฟล์ (ทางเลือก)</label>
                <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors relative group bg-gray-50/30">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="doc-file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-700">
                        <span>คลิกเพื่ออัปโหลด</span>
                        <input id="doc-file-upload" name="doc-file-upload" type="file" className="sr-only"
                          onChange={(e) => setFormData({ ...formData, fileName: e.target.files[0]?.name })} />
                      </label>
                      <p className="pl-1">หรือลากไฟล์มาวาง</p>
                    </div>
                    {formData.fileName && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                        <File size={14} /> {formData.fileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20">เพิ่มเอกสาร</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;