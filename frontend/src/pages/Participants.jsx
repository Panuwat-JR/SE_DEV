import React from 'react';
import { Plus, Search, Mail, Phone, Building2, ChevronDown } from 'lucide-react';

const Participants = () => {
  // --- ส่วนของ Mock Data สำหรับ UI หน้าผู้เข้าร่วม ---
  const stats = [
    { id: 1, title: "ผู้เข้าร่วมทั้งหมด", value: "156", color: "text-gray-900" },
    { id: 2, title: "เมนเทอร์", value: "67", color: "text-blue-600" },
    { id: 3, title: "ผู้ประกอบการ", value: "89", color: "text-emerald-600" }
  ];

  const participants = [
    {
      id: 1,
      name: "ดร.สมศักดิ์ รักเรียน",
      initial: "ด",
      type: "เมนเทอร์",
      email: "somsak@example.com",
      phone: "081-234-5678",
      organization: "มหาวิทยาลัยนเรศวร",
      projects: "5 โครงการ",
      status: "ใช้งานอยู่"
    },
    {
      id: 2,
      name: "นายวิชัย ใจสู้",
      initial: "น",
      type: "ผู้ประกอบการ",
      email: "wichai@startup.com",
      phone: "089-876-5432",
      organization: "Tech Startup Co.",
      projects: "2 โครงการ",
      status: "ใช้งานอยู่"
    },
    {
      id: 3,
      name: "น.ส.มานี มีทรัพย์",
      initial: "น",
      type: "ผู้ประกอบการ",
      email: "manee@business.com",
      phone: "086-111-2222",
      organization: "Green Business",
      projects: "3 โครงการ",
      status: "ใช้งานอยู่"
    }
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผู้เข้าร่วมโครงการ</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลเมนเทอร์และผู้ประกอบการ</p>
        </div>
        <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>เพิ่มผู้เข้าร่วม</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1">{stat.title}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, อีเมล, หน่วยงาน..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none">
            <option>ทั้งหมด</option>
            <option>เมนเทอร์</option>
            <option>ผู้ประกอบการ</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none">
            <option>ใช้งานอยู่</option>
            <option>ปิดใช้งาน</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">ชื่อ-สกุล</th>
              <th className="px-6 py-4">ประเภท</th>
              <th className="px-6 py-4">ติดต่อ</th>
              <th className="px-6 py-4">หน่วยงาน</th>
              <th className="px-6 py-4 text-center">โครงการ</th>
              <th className="px-6 py-4 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {participants.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {person.initial}
                    </div>
                    <span className="font-medium text-gray-900">{person.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    person.type === 'เมนเทอร์' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {person.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} /> {person.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={12} /> {person.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={14} /> {person.organization}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-xs font-medium">{person.projects}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] rounded-full font-bold">
                    {person.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Participants;