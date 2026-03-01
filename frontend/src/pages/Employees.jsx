import React, { useState } from 'react';
import { Plus, Search, Filter, Mail, Building2, Circle, MoreHorizontal, X, Phone, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Employees = () => {
  const { employees, addEmployee } = useApp();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEmp, setNewEmp] = useState({ first_name: '', last_name: '', role: '', department: '', email: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    addEmployee(newEmp);
    setIsCreateOpen(false);
    setNewEmp({ first_name: '', last_name: '', role: '', department: '', email: '' });
  };

  const filtered = employees.filter(emp => {
    const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = [
    { id: 1, title: 'พนักงานทั้งหมด', value: String(employees.length), color: 'text-blue-600' },
    { id: 2, title: 'ออนไลน์', value: String(employees.filter(e => e.online_status === 'online').length), color: 'text-emerald-600' },
    { id: 3, title: 'ออฟไลน์', value: String(employees.filter(e => e.online_status === 'offline').length), color: 'text-gray-400' },
    { id: 4, title: 'แผนก', value: String(new Set(employees.map(e => e.department)).size), color: 'text-gray-900' },
  ];

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">พนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึง</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20">
          <Plus size={18} /> <span>เพิ่มพนักงาน</span>
        </button>
      </div>

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
            <input type="text" placeholder="ค้นหาพนักงาน..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium">
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
                <th className="px-6 py-4">เพศ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${emp.color || 'bg-blue-600'} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                        {emp.initial}
                      </div>
                      <div className="flex flex-col">
                        <button onClick={() => { setSelectedEmp(emp); setIsContactModalOpen(true); }}
                          className="font-bold text-gray-900 text-sm text-left hover:text-blue-600 transition-colors">
                          {emp.first_name} {emp.last_name}
                        </button>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {emp.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200 font-semibold whitespace-nowrap">{emp.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Building2 size={16} className="text-gray-400" /> {emp.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Circle size={10} fill={emp.online_status === 'online' ? '#10b981' : '#9ca3af'} className={emp.online_status === 'online' ? 'text-emerald-500' : 'text-gray-400'} />
                      <span className={emp.online_status === 'online' ? 'text-emerald-600' : 'text-gray-500'}>
                        {emp.online_status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{emp.gender || '-'}</td>
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

      {/* Contact Modal */}
      {isContactModalOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-[400px] shadow-2xl overflow-hidden p-7 relative">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center mb-6 pt-2">
              <div className={`w-20 h-20 ${selectedEmp.color || 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mb-4`}>
                {selectedEmp.initial}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedEmp.first_name} {selectedEmp.last_name}</h3>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5"><Mail size={14} /> {selectedEmp.email}</p>
            </div>
            <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500 font-medium">ตำแหน่ง</span>
                <span className="font-bold text-gray-800">{selectedEmp.role}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500 font-medium">แผนก</span>
                <span className="font-bold text-gray-800">{selectedEmp.department}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2.5">
                <span className="text-gray-500 font-medium">เพศ</span>
                <span className="font-bold text-gray-800">{selectedEmp.gender || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">สถานะ</span>
                <span className={`font-bold flex items-center gap-1.5 ${selectedEmp.online_status === 'online' ? 'text-emerald-600' : 'text-gray-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedEmp.online_status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                  {selectedEmp.online_status === 'online' ? 'ออนไลน์' : 'ออฟไลน์'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsContactModalOpen(false)} className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[480px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">เพิ่มพนักงาน</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.first_name} onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newEmp.last_name} onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น ผู้จัดการโครงการ"
                  value={newEmp.role} onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น ฝ่ายโครงการ"
                  value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="name@se.dev"
                  value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">เพิ่มพนักงาน</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;