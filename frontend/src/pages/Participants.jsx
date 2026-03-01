import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Building2, ChevronDown, X, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Participants = () => {
  const { participants, teams, addParticipant, deleteParticipant } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '', lastname: '', team_id: '', faculty: '', major: '', student_id: '', year_of_study: '', phone: '', email: '', type: 'นิสิต/นักศึกษา'
  });

  const handleCreate = (e) => {
    e.preventDefault();
    addParticipant({ ...formData, year_of_study: Number(formData.year_of_study) });
    setIsCreateOpen(false);
    setFormData({ firstname: '', lastname: '', team_id: '', faculty: '', major: '', student_id: '', year_of_study: '', phone: '', email: '', type: 'นิสิต/นักศึกษา' });
  };

  const filtered = participants.filter(p => {
    const name = `${p.firstname} ${p.lastname}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || (p.team_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = [
    { id: 1, title: 'ผู้เข้าร่วมทั้งหมด', value: String(participants.length), color: 'text-gray-900' },
    { id: 2, title: 'จำนวนทีม', value: String(teams.length), color: 'text-blue-600' },
    { id: 3, title: 'นิสิต/นักศึกษา', value: String(participants.filter(p => p.type?.includes('นิสิต')).length), color: 'text-emerald-600' },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผู้เข้าร่วมโครงการ</h1>
          <p className="text-gray-500 text-sm">จัดการข้อมูลผู้เข้าร่วมและทีม</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> <span>เพิ่มผู้เข้าร่วม</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1">{stat.title}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="ค้นหาชื่อ, ทีม..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative">
          <select className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none">
            <option>ทั้งหมด</option>
            <option>นิสิต/นักศึกษา</option>
            <option>บุคคลทั่วไป</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">ชื่อ-สกุล</th>
              <th className="px-6 py-4">คณะ/สาขา</th>
              <th className="px-6 py-4">ทีม</th>
              <th className="px-6 py-4">ติดต่อ</th>
              <th className="px-6 py-4 text-center">ปี</th>
              <th className="px-6 py-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {filtered.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {person.firstname?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{person.firstname} {person.lastname}</div>
                      <div className="text-[10px] text-gray-400">{person.student_id || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">{person.faculty}</div>
                  <div className="text-xs text-gray-400">{person.major}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                    {person.team_name || 'ไม่ระบุทีม'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={12} /> {person.email}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={12} /> {person.phone || '-'}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-xs font-medium">ปี {person.year_of_study}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => { if (window.confirm(`ลบ ${person.firstname}?`)) deleteParticipant(person.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-400">ไม่พบข้อมูลผู้เข้าร่วม</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[560px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">เพิ่มผู้เข้าร่วม</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล *</label>
                  <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คณะ</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.faculty} onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิชา</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนิสิต</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชั้นปี</label>
                  <input type="number" min="1" max="6" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.year_of_study} onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ทีม</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.team_id} onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}>
                  <option value="">-- ไม่ระบุทีม --</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">เพิ่มผู้เข้าร่วม</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;