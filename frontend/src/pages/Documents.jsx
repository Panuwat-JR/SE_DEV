import React from 'react';
import { Plus, Search, FileText, Download, Eye, Calendar, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documents = () => {
  const stats = [
    { id: 1, title: "เอกสารทั้งหมด", value: "342", color: "text-gray-900" },
    { id: 2, title: "เดือนนี้", value: "45", color: "text-blue-600" },
    { id: 3, title: "รอการดำเนินการ", value: "12", color: "text-amber-500" },
    { id: 4, title: "ร่าง", value: "8", color: "text-gray-400" }
  ];

  // เพิ่มข้อมูลจำลองให้ครบ 6 ชิ้นเพื่อแสดง 2 แถวสวยๆ
  const documents = [
    { id: 1, title: "บันทึกข้อความขออนุมัติโครงการ", status: "อนุมัติแล้ว", project: "โครงการพัฒนาผู้ประกอบการ Batch 5", author: "อนุชา สมศรี", date: "5 ก.พ. 2569", type: "doc" },
    { id: 2, title: "รายงานสรุปผลการดำเนินงานประจำเดือน", status: "ร่าง", project: "Innovation Hub Phase 2", author: "วิไลวรรณ สุขใจ", date: "1 ก.พ. 2569", type: "report" },
    { id: 3, title: "ใบเบิกค่าใช้จ่าย - ค่าวิทยากร", status: "รอการดำเนินการ", project: "โครงการพัฒนาผู้ประกอบการ Batch 5", author: "นิภา ศรีสุข", date: "28 ม.ค. 2569", type: "finance" },
    { id: 4, title: "บันทึกข้อความขออนุมัติโครงการ (เพิ่มเติม)", status: "อนุมัติแล้ว", project: "โครงการพัฒนาผู้ประกอบการ Batch 5", author: "อนุชา สมศรี", date: "5 ก.พ. 2569", type: "doc" },
    { id: 5, title: "รายงานสรุปผลการดำเนินงาน (แก้ไข)", status: "ร่าง", project: "Innovation Hub Phase 2", author: "วิไลวรรณ สุขใจ", date: "1 ก.พ. 2569", type: "report" },
    { id: 6, title: "ใบเบิกค่าใช้จ่าย - ค่าเดินทาง", status: "รอการดำเนินการ", project: "โครงการพัฒนาผู้ประกอบการ Batch 5", author: "นิภา ศรีสุข", date: "28 ม.ค. 2569", type: "finance" }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'อนุมัติแล้ว': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ร่าง': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'รอการดำเนินการ': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
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
        <button className="bg-[#2563eb] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all font-medium">
          <Plus size={20} />
          <span>สร้างเอกสารใหม่</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wider">{stat.title}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาเอกสาร..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm transition-all"
          />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors">
            <option>ทุกประเภท</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors">
            <option>ทั้งหมด</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Documents Grid (รวบเหลืออันเดียว) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          /* ปรับ Card ตรงนี้: ขยาย padding (p-6), ทำมุมมนขึ้น (rounded-2xl), ใส่เงาและ hover effect */
          <div key={doc.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">

            <div className="flex items-start gap-4 mb-4">
              {/* ปรับ Icon ตรงนี้: ขยายขนาด (w-12 h-12) และเพิ่ม effect ตอน hover กล่อง */}
              <div className="w-12 h-12 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                <FileText size={22} strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0 pr-16">
                <h3 className="font-bold text-gray-900 text-sm truncate leading-tight mb-1 group-hover:text-blue-600 transition-colors">{doc.title}</h3>
                <p className="text-[11px] text-gray-500 truncate">{doc.project}</p>
              </div>

              {/* ปรับ Badge ตรงนี้: เปลี่ยนเป็นทรงแคปซูล (rounded-full) */}
              <span className={`absolute top-6 right-6 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(doc.status)}`}>
                {doc.status}
              </span>
            </div>

            {/* ดันข้อมูลคนเขียนกับวันที่ให้ชิดด้านล่างเสมอ */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-5 mt-auto font-medium">
              <div className="flex items-center gap-1.5">
                <User size={13} /> {doc.author}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} /> {doc.date}
              </div>
            </div>

            {/* ปรับปุ่มตรงนี้: ให้ปุ่ม 'ดู' มี hover สีฟ้า และปุ่ม 'ดาวน์โหลด' มี hover สีเทา */}
            <div className="flex gap-3 pt-5 border-t border-gray-100">
              <Link
                to={`/documents/${doc.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-50/50 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Eye size={16} /> ดู
              </Link>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-50/50 hover:bg-gray-100 hover:text-gray-900 transition-all">
                <Download size={16} /> ดาวน์โหลด
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;