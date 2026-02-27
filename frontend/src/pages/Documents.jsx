import React from 'react';
import { Plus, Search, FileText, Download, Eye, Calendar, User, ChevronDown } from 'lucide-react';

const Documents = () => {
  // --- Mock Data สำหรับหน้าเอกสาร ---
  const stats = [
    { id: 1, title: "เอกสารทั้งหมด", value: "342", color: "text-gray-900" },
    { id: 2, title: "เดือนนี้", value: "45", color: "text-blue-600" },
    { id: 3, title: "รอการดำเนินการ", value: "12", color: "text-amber-500" },
    { id: 4, title: "ร่าง", value: "8", color: "text-gray-400" }
  ];

  const documents = [
    {
      id: 1,
      title: "บันทึกข้อความขออนุมัติโครงการ",
      status: "อนุมัติแล้ว",
      project: "โครงการพัฒนาผู้ประกอบการ Batch 5",
      author: "อนุชา สมศรี",
      date: "5 ก.พ. 2569",
      type: "doc"
    },
    {
      id: 2,
      title: "รายงานสรุปผลการดำเนินงานประจำเดือน",
      status: "ร่าง",
      project: "Innovation Hub Phase 2",
      author: "วิไลวรรณ สุขใจ",
      date: "1 ก.พ. 2569",
      type: "report"
    },
    {
      id: 3,
      title: "ใบเบิกค่าใช้จ่าย - ค่าวิทยากร",
      status: "รอการดำเนินการ",
      project: "โครงการพัฒนาผู้ประกอบการ Batch 5",
      author: "นิภา ศรีสุข",
      date: "28 ม.ค. 2569",
      type: "finance"
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'อนุมัติแล้ว': return 'bg-emerald-500 text-white';
      case 'ร่าง': return 'bg-gray-200 text-gray-600';
      case 'รอการดำเนินการ': return 'bg-amber-400 text-white';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เอกสาร</h1>
          <p className="text-gray-500 text-sm">จัดการและสร้างเอกสารราชการอัตโนมัติ</p>
        </div>
        <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={20} />
          <span className="font-medium">สร้างเอกสารใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">{stat.title}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาเอกสาร..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none">
            <option>ทุกประเภท</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none">
            <option>ทั้งหมด</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate pr-16">{doc.title}</h3>
                <span className={`absolute top-5 right-5 px-2 py-0.5 rounded text-[9px] font-bold ${getStatusStyle(doc.status)}`}>
                  {doc.status}
                </span>
                <p className="text-[11px] text-gray-400 mt-1 truncate">{doc.project}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-6 px-1">
              <div className="flex items-center gap-1">
                <User size={12} /> {doc.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} /> {doc.date}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-50">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Eye size={14} /> ดู
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} /> ดาวน์โหลด
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;