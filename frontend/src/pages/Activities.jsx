import React, { useState, useEffect } from 'react';
// 1. นำเข้า Link และเพิ่มไอคอน Eye (รูปตา) มาใช้งาน
import { Search, Plus, Filter, Edit, Trash2, Clock, Trophy, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = () => {
    fetch('http://localhost:5000/api/dashboard-data')
      .then(res => res.json())
      .then(data => setActivities(data.upcomingActivities))
      .catch(err => console.error("ดึงข้อมูลไม่สำเร็จ:", err));
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรม "${title}" ?`)) {
      fetch(`http://localhost:5000/api/activities/${id}`, {
        method: 'DELETE',
      })
      .then(res => res.json())
      .then(() => {
        fetchActivities();
      })
      .catch(err => console.error("ลบข้อมูลไม่สำเร็จ:", err));
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      
      {/* ================= 1. ส่วนหัวและปุ่มสร้าง ================= */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการกิจกรรม</h1>
          <p className="text-sm text-gray-500 mt-1">รายการกิจกรรมทั้งหมด ทั้งที่กำลังดำเนินการและที่ผ่านมาแล้ว</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* ================= 2. ส่วนค้นหาและตัวกรอง ================= */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อกิจกรรม..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter size={16} /> กรองสถานะ
          </button>
        </div>

        {/* ================= 3. ส่วนตารางข้อมูล ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium">ชื่อกิจกรรม</th>
                <th className="p-4 font-medium">วันที่จัด</th>
                <th className="p-4 font-medium">สถานะ</th>
                <th className="p-4 font-medium">ผู้เข้าร่วม</th>
                <th className="p-4 font-medium">เงินรางวัล</th>
                <th className="p-4 font-medium text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  
                  {/* 2. ใช้ <Link> ครอบที่ชื่อกิจกรรม เพื่อให้กดเปลี่ยนหน้าได้ */}
                  <td className="p-4 font-semibold text-gray-800">
                    <Link to={`/activities/${activity.id}`} className="hover:text-blue-600 transition-colors">
                      {activity.title}
                    </Link>
                  </td>
                  
                  <td className="p-4 text-gray-500">
                    <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> {activity.date_text}</div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                      activity.status === 'กำลังดำเนินการ' ? 'bg-emerald-100 text-emerald-700' :
                      activity.status === 'เปิดรับสมัคร' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(activity.current_participants / activity.max_participants) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 w-12">{activity.current_participants}/{activity.max_participants}</span>
                    </div>
                  </td>

                  <td className="p-4 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5"><Trophy size={14} className="text-gray-400"/> {activity.prize_money}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* 3. เพิ่มปุ่ม "ดูรายละเอียด (รูปตา)" ที่ใช้ <Link> ได้เลย */}
                      <Link 
                        to={`/activities/${activity.id}`} 
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={16} />
                      </Link>

                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข">
                        <Edit size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(activity.id, activity.title)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" 
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  
                </tr>
              ))}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">ไม่พบข้อมูลกิจกรรม</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <div>แสดง {filteredActivities.length} รายการ</div>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">ก่อนหน้า</button>
            <button className="px-2 py-1 border border-gray-200 rounded bg-blue-50 text-blue-600 font-medium">1</button>
            <button className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50">ถัดไป</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Activities;