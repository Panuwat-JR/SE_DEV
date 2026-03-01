import React, { useState } from 'react';
import { Plus, Search, Filter, Users, FolderKanban, FileText, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Teams = () => {
  const { teams, events, addTeam, stats } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', project_name: '', event_id: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    addTeam({ ...formData, members: [] });
    setIsCreateOpen(false);
    setFormData({ name: '', project_name: '', event_id: '' });
  };

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.project_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsCards = [
    { id: 1, title: 'ทีมทั้งหมด', value: String(stats.registered_teams), valueColor: 'text-blue-600' },
    { id: 2, title: 'สมาชิกรวม', value: String(teams.reduce((s, t) => s + t.memberCount, 0)), valueColor: 'text-emerald-600' },
    { id: 3, title: 'โครงการ', value: String(stats.total_activities), valueColor: 'text-gray-900' },
    { id: 4, title: 'เอกสารทั้งหมด', value: String(stats.total_documents), valueColor: 'text-gray-900' },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900">ทีม</h1>
        <button onClick={() => setIsCreateOpen(true)} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> <span>สร้างทีมใหม่</span>
        </button>
      </div>
      <p className="text-gray-500 mb-8 text-sm">จัดการทีมและสมาชิกในแต่ละกิจกรรม</p>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="ค้นหาทีม..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
          <Filter size={18} /> <span>ตัวกรอง</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className={`text-3xl font-bold mb-1 ${stat.valueColor}`}>{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((team) => (
          <Link to={`/teams/${team.id}`} key={team.id} className="block bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group relative cursor-pointer">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{team.name}</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.preventDefault()}><MoreVertical size={20} /></button>
            </div>
            <p className="text-gray-500 text-sm mb-4">{team.project_name}</p>
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">{team.event || 'ไม่ระบุกิจกรรม'}</span>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><Users size={16} /> <span>สมาชิก ({team.memberCount} คน)</span></div>
              <div className="flex flex-wrap gap-4">
                {team.members?.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <div className={`w-6 h-6 ${member.color} text-white rounded-full flex items-center justify-center text-[10px] font-bold`}>{member.initial}</div>
                    <span className="text-xs font-medium text-gray-700">{member.name}</span>
                    {member.isLeader && <span className="px-1.5 py-0.5 bg-[#10b981] text-white text-[9px] rounded-md font-bold">หัวหน้า</span>}
                  </div>
                ))}
                {(!team.members || team.members.length === 0) && <span className="text-xs text-gray-400">ยังไม่มีสมาชิก</span>}
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-1.5"><FolderKanban size={14} /> <span>1 โครงการ</span></div>
              <div className="flex items-center gap-1.5"><FileText size={14} /> <span>{team.docsCount} เอกสาร</span></div>
            </div>
            <div className="absolute top-6 right-12 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">ดูรายละเอียด &rarr;</div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">ไม่พบข้อมูลทีม</div>}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[480px] shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">สร้างทีมใหม่</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อทีม <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น Team Alpha"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโครงการ</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น Smart City App"
                  value={formData.project_name} onChange={(e) => setFormData({ ...formData, project_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กิจกรรมที่เข้าร่วม</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.event_id} onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}>
                  <option value="">-- ไม่ระบุ --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl">สร้างทีม</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;