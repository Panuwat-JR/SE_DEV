import React from 'react';
import { ArrowLeft, Download, Printer, CheckCircle, XCircle, Clock, FileText, User, Calendar, Building2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const DocumentDetail = () => {
  // ดึง ID จาก URL (เช่น /documents/1) เพื่อไว้ดึงข้อมูลจริงในอนาคต
  const { id } = useParams();

  // Mock Data สำหรับหน้ารายละเอียดเอกสาร
  const doc = {
    title: "บันทึกข้อความขออนุมัติโครงการ",
    status: "อนุมัติแล้ว",
    project: "โครงการพัฒนาผู้ประกอบการ Batch 5",
    author: "อนุชา สมศรี",
    department: "ฝ่ายบริหาร",
    date: "5 ก.พ. 2569",
    type: "doc",
    fileSize: "2.4 MB"
  };

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
      {/* Header & Back Button */}
      <div className="mb-6">
        <Link to="/documents" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium">
          <ArrowLeft size={16} />
          กลับไปหน้าเอกสาร
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm">รหัสเอกสาร: DOC-2026-00{id || '1'}</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
              <Printer size={18} /> พิมพ์
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-600/20">
              <Download size={18} /> ดาวน์โหลด PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ฝั่งซ้าย: Document Preview (พื้นที่จำลอง A4) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-200 rounded-xl p-4 md:p-8 flex justify-center items-start min-h-[800px] border border-gray-200 shadow-inner">
            {/* กระดาษ A4 Mockup */}
            <div className="bg-white w-full max-w-[210mm] aspect-[1/1.414] shadow-md rounded-sm p-12 flex flex-col items-center justify-center text-gray-400">
              <FileText size={64} className="mb-4 text-gray-300" strokeWidth={1} />
              <p className="font-medium text-lg">พื้นที่แสดงตัวอย่างเอกสาร</p>
              <p className="text-sm mt-2 text-gray-400">เมื่อเชื่อมต่อระบบ จะแสดงไฟล์ {doc.title}.pdf ที่นี่</p>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: Details & Actions */}
        <div className="space-y-6">
          
          {/* การ์ดข้อมูลเอกสาร */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 border-b border-gray-50 pb-3">ข้อมูลเอกสาร</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-400 block mb-1">โครงการที่เกี่ยวข้อง</span>
                <p className="text-sm font-medium text-gray-800">{doc.project}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">ผู้จัดทำ</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <User size={16} className="text-gray-400" />
                  {doc.author}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">แผนก</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Building2 size={16} className="text-gray-400" />
                  {doc.department}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-1">วันที่สร้าง</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Calendar size={16} className="text-gray-400" />
                  {doc.date}
                </div>
              </div>
            </div>
          </div>

          {/* การ์ดประวัติสถานะ (Timeline) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 border-b border-gray-50 pb-3">ประวัติการดำเนินการ</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
              {/* สเต็ป 1: ร่างเอกสาร */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle size={12} />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-gray-50 ml-4 md:ml-0 md:group-even:pr-4 md:group-odd:pl-4">
                  <p className="text-sm font-bold text-gray-900">สร้างร่างเอกสาร</p>
                  <p className="text-[11px] text-gray-500 mt-1">{doc.author} • 4 ก.พ. 2569, 10:00 น.</p>
                </div>
              </div>

              {/* สเต็ป 2: รออนุมัติ */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle size={12} />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-gray-50 ml-4 md:ml-0 md:group-even:pr-4 md:group-odd:pl-4">
                  <p className="text-sm font-bold text-gray-900">ส่งขออนุมัติ</p>
                  <p className="text-[11px] text-gray-500 mt-1">{doc.author} • 4 ก.พ. 2569, 14:30 น.</p>
                </div>
              </div>

              {/* สเต็ป 3: อนุมัติแล้ว */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <CheckCircle size={12} />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-emerald-100 bg-emerald-50 ml-4 md:ml-0 md:group-even:pr-4 md:group-odd:pl-4">
                  <p className="text-sm font-bold text-emerald-800">อนุมัติเอกสารแล้ว</p>
                  <p className="text-[11px] text-emerald-600 mt-1">ดร.สมชาย พัฒนกิจ • 5 ก.พ. 2569, 09:15 น.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;