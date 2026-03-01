import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Building2, Circle, MoreHorizontal, X, Phone, User } from 'lucide-react';

const Employees = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

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
      activityList: ["โครงการ Startup", "อบรม AI", "Pitching Day", "Hackathon", "กิจกรรมสานสัมพันธ์"],
      lastLogin: "วันนี้ 09:30",
      phone: "081-234-5678",
      age: 45
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
      activityList: ["แข่งไอเดีย", "ELP", "Startup Thailand", "อบรมการตลาด", "Workshop การเงิน", "Mentoring", "Pitch Deck", "Demo Day"],
      lastLogin: "วันนี้ 10:15",
      phone: "089-876-5432",
      age: 38
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
      activityList: ["จัดค่ายอาสา", "สัมมนาวิชาการ", "ปฐมนิเทศ"],
      lastLogin: "เมื่อวาน 16:45",
      phone: "082-345-6789",
      age: 28
    }
  ];

  const handleOpenContact = (emp) => {
    setSelectedEmp(emp);
    setIsContactModalOpen(true);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">พนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20">
          <Plus size={18} />
          <span>เพิ่มพนักงาน</span>
        </button>
      </div>

      {/* Stats Cards - เอาวงกลมตกแต่งออกแล้ว */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className={`text-4xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาพนักงาน..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all">
            <Filter size={16} /> กรองข้อมูล
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">พนักงาน</th>
                <th className="px-6 py-4">ตำแหน่ง</th>
                <th className="px-6 py-4">แผนก</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">กิจกรรม</th>
                <th className="px-6 py-4">เข้าสู่ระบบล่าสุด</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                        {emp.initial}
                      </div>
                      <div className="flex flex-col">
                        <button 
                          onClick={() => handleOpenContact(emp)}
                          className="font-bold text-gray-900 text-sm text-left hover:text-blue-600 transition-colors"
                        >
                          {emp.name}
                        </button>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {emp.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200 font-semibold whitespace-nowrap">
                      {emp.position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Building2 size={16} className="text-gray-400" /> {emp.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Circle size={10} fill={emp.status === 'ออนไลน์' ? '#10b981' : '#9ca3af'} className={emp.status === 'ออนไลน์' ? 'text-emerald-500' : 'text-gray-400'} />
                      <span className={emp.status === 'ออนไลน์' ? 'text-emerald-600' : 'text-gray-500'}>{emp.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{emp.activities}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{emp.lastLogin}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isContactModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-[400px] shadow-2xl overflow-hidden p-7 relative animate-in fade-in zoom-in duration-200">
            
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6 pt-2">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-600/30 mb-4">
                {selectedEmp.initial}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{selectedEmp.name}</h3>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
                <Mail size={14}/> {selectedEmp.email}
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">ข้อมูลส่วนตัว</h4>
                <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><Phone size={14} className="text-gray-400"/> เบอร์โทรศัพท์</span>
                    <span className="font-bold text-gray-800">{selectedEmp.phone}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><User size={14} className="text-gray-400"/> อายุ</span>
                    <span className="font-bold text-gray-800">{selectedEmp.age} ปี</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">ข้อมูลการทำงาน</h4>
                <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium">ตำแหน่ง</span>
                    <span className="font-bold text-gray-800">{selectedEmp.position}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium">แผนก</span>
                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                      <Building2 size={14} className="text-gray-400"/> {selectedEmp.department}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                    <span className="text-gray-500 font-medium">สถานะ</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedEmp.status === 'ออนไลน์' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      <span className={selectedEmp.status === 'ออนไลน์' ? 'text-emerald-600' : 'text-gray-500'}>{selectedEmp.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex flex-col border-b border-gray-200/60 pb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium">ความรับผิดชอบ</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{selectedEmp.activities}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedEmp.activityList && selectedEmp.activityList.map((act, idx) => (
                        <span key={idx} className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md shadow-sm">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-[11px] text-gray-400">เข้าสู่ระบบล่าสุด</span>
                    <span className="text-[11px] text-gray-500 font-medium">{selectedEmp.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsContactModalOpen(false)} 
              className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
            >
              ปิดหน้าต่าง
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;