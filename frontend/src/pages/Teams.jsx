import React from 'react';
import { Plus, Search, Filter, Users, FolderKanban, FileText, MoreVertical } from 'lucide-react';

const Teams = () => {
  // --- ส่วนของ Mock Data สำหรับ UI ---
  const stats = [
    { id: 1, title: "ทีมทั้งหมด", value: "4", valueColor: "text-blue-600" },
    { id: 2, title: "สมาชิกรวม", value: "14", valueColor: "text-emerald-600" },
    { id: 3, title: "โครงการ", value: "4", valueColor: "text-gray-900" },
    { id: 4, title: "เอกสารทั้งหมด", value: "18", valueColor: "text-gray-900" }
  ];

  const teamsData = [
    {
      id: 1,
      name: "Team Alpha",
      project: "Smart Farming IoT",
      event: "Startup Thailand League 2569",
      memberCount: 4,
      docsCount: 5,
      members: [
        { name: "สมชาย ใ.", initial: "ส", isLeader: true, color: "bg-blue-600" },
        { name: "วิไลวรรณ ส.", initial: "ว", isLeader: false, color: "bg-blue-500" },
        { name: "อนุชา ส.", initial: "อ", isLeader: false, color: "bg-blue-700" },
        { name: "นิภา ศ.", initial: "น", isLeader: false, color: "bg-blue-400" },
      ]
    },
    {
      id: 2,
      name: "InnovateTech",
      project: "AI Health Assistant",
      event: "Startup Thailand League 2569",
      memberCount: 3,
      docsCount: 3,
      members: [
        { name: "กานดา ม.", initial: "ก", isLeader: true, color: "bg-blue-600" },
        { name: "ประวิทย์ ร.", initial: "ป", isLeader: false, color: "bg-blue-500" },
        { name: "มณีรัตน์ ส.", initial: "ม", isLeader: false, color: "bg-blue-700" },
      ]
    }
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900">ทีม</h1>
        <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>สร้างทีมใหม่</span>
        </button>
      </div>
      <p className="text-gray-500 mb-8 text-sm">จัดการทีมและสมาชิกในแต่ละกิจกรรม</p>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาทีม..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
          <Filter size={18} />
          <span>ตัวกรอง</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className={`text-3xl font-bold mb-1 ${stat.valueColor}`}>{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamsData.map((team) => (
          <div key={team.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">{team.project}</p>
            
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                {team.event}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Users size={16} />
                <span>สมาชิก ({team.memberCount} คน)</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {team.members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <div className={`w-6 h-6 ${member.color} text-white rounded-full flex items-center justify-center text-[10px] font-bold`}>
                      {member.initial}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{member.name}</span>
                    {member.isLeader && (
                      <span className="px-1.5 py-0.5 bg-[#10b981] text-white text-[9px] rounded-md font-bold">
                        หัวหน้า
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-50 text-xs text-gray-500 font-medium">
              <div className="flex items-center gap-1.5">
                <FolderKanban size={14} />
                <span>1 โครงการ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText size={14} />
                <span>{team.docsCount} เอกสาร</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;