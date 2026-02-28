import React from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy, Users, CheckSquare, Settings } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const ActivityDetail = () => {
  const { id } = useParams(); // ดึง ID จาก URL

  // Mock Data จำลองข้อมูลรายละเอียด
  const activity = {
    name: "Experiential Learning Program (ELP)",
    status: "เปิดรับสมัคร",
    date: "25/02/2026 - 30/04/2026",
    location: "อาคารวิทยบริการ มหาวิทยาลัยนเรศวร",
    prize: "5,000 บาท",
    participants: "0/100",
    description: "โครงการส่งเสริมศักยภาพความเป็นผู้ประกอบการสำหรับนิสิต เพื่อพัฒนาไอเดียธุรกิจนวัตกรรมและต่อยอดสู่การทำธุรกิจจริงจัง พร้อมเงินทุนสนับสนุนเบื้องต้น"
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-6">
        <Link to="/activities" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium">
          <ArrowLeft size={16} />
          กลับไปหน้ารายการกิจกรรม
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                {activity.status}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <MapPin size={16} /> {activity.location}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            <Settings size={18} /> จัดการกิจกรรม
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ฝั่งซ้าย (กินพื้นที่ 2 ส่วน) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">รายละเอียดโครงการ</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {activity.description}
            </p>
          </div>

          {/* ตารางกำหนดการ (Timeline) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> กำหนดการ
            </h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-blue-100 bg-blue-50 ml-6 md:ml-0 md:group-even:pr-6 md:group-odd:pl-6 shadow-sm">
                  <h4 className="font-bold text-blue-900">เปิดรับสมัคร</h4>
                  <p className="text-sm text-blue-700/80 mt-1">25 ก.พ. - 15 มี.ค. 2569</p>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-200 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  2
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white ml-6 md:ml-0 md:group-even:pr-6 md:group-odd:pl-6">
                  <h4 className="font-bold text-gray-900">วันปฐมนิเทศ (Orientation)</h4>
                  <p className="text-sm text-gray-500 mt-1">20 มี.ค. 2569</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา (Stats & Management) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            
            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600/80 uppercase">เงินรางวัลรวม</p>
                <p className="text-xl font-bold text-amber-700">{activity.prize}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Users size={16} className="text-gray-400" /> ผู้เข้าร่วม
                </span>
                <span className="text-sm font-bold text-gray-900">{activity.participants}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-gray-400" /> งานที่เกี่ยวข้อง (Tasks)
              </span>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-700 font-medium">เบิกค่าสถานที่</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">รอดำเนินการ</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-700 font-medium">เอกสารประชาสัมพันธ์</span>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">เสร็จสิ้น</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;