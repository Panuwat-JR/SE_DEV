import React from 'react';
import { Plus, Search, Filter, Mail, Building2, Circle, MoreHorizontal } from 'lucide-react';

const Employees = () => {
  // --- ส่วนของ Mock Data สำหรับหน้าพนักงาน ---
  const stats = [
    { id: 1, title: "พนักงานทั้งหมด", value: "6", color: "text-blue-600" },
    { id: 2, title: "ออนไลน์", value: "4", color: "text-emerald-600" },
    { id: 3, title: "ออฟไลน์", value: "2", color: "text-gray-400" },
    { id: 4, title: "แผนก", value: "5", color: "text-gray-900" }
  ];

  const employees = [
    {
      id: 1,
      name: "ดร.สมชาย พัฒนกิจ",
      email: "somchai.p@nu.ac.th",
      initial: "ด",
      position: "ผู้อำนวยการ",
      department: "NU SEED",
      status: "ออนไลน์",
      activities: "5 กิจกรรม",
      lastLogin: "วันนี้ 09:30"
    },
    {
      id: 2,
      name: "อ.วิไลวรรณ สุขใจ",
      email: "wilaiwan.s@nu.ac.th",
      initial: "อ",
      position: "ผู้จัดการโครงการ",
      department: "NU SEED",
      status: "ออนไลน์",
      activities: "8 กิจกรรม",
      lastLogin: "วันนี้ 10:15"
    },
    {
      id: 3,
      name: "นายอนุชา สมศรี",
      email: "anucha.s@nu.ac.th",
      initial: "น",
      position: "เจ้าหน้าที่ประสานงาน",
      department: "ฝ่ายบริหาร",
      status: "ออฟไลน์",
      activities: "3 กิจกรรม",
      lastLogin: "เมื่อวาน 16:45"
    }
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">พนักงาน</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง</p>
        </div>
        <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาพนักงาน..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm">
          <Filter size={18} />
          <span>ตัวกรอง</span>
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">พนักงาน</th>
              <th className="px-6 py-4">ตำแหน่ง</th>
              <th className="px-6 py-4">แผนก</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4">กิจกรรม</th>
              <th className="px-6 py-4">เข้าสู่ระบบล่าสุด</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {emp.initial}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-xs">{emp.name}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Mail size={10} /> {emp.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] rounded-full border border-gray-100 font-bold">
                    {emp.position}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Building2 size={14} /> {emp.department}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <Circle size={8} fill={emp.status === 'ออนไลน์' ? '#10b981' : '#9ca3af'} className={emp.status === 'ออนไลน์' ? 'text-emerald-500' : 'text-gray-400'} />
                    <span className={emp.status === 'ออนไลน์' ? 'text-emerald-600' : 'text-gray-400'}>{emp.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium">{emp.activities}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{emp.lastLogin}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-300 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;