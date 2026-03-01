import React from 'react';
import { ArrowLeft, Users, FileText, Calendar, Mail, Phone, Award, Download, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TeamDetail = () => {
  const { id } = useParams();
  const { teams, documents } = useApp();

  const team = teams.find(t => String(t.id) === String(id));

  if (!team) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">ไม่พบข้อมูลทีม</p>
        <Link to="/teams" className="text-blue-600 hover:underline">← กลับไปหน้าทีม</Link>
      </div>
    );
  }

  const teamDocs = documents.filter(d => d.project === team.project_name);
  const members = team.members || [];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="mb-8">
        <Link to="/teams" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> กลับไปหน้าจัดการทีม
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                {team.event || 'ไม่ระบุกิจกรรม'}
              </span>
            </div>
            <p className="text-gray-500 text-lg flex items-center gap-2">
              <Target size={18} className="text-blue-500" /> {team.project_name || 'ยังไม่ระบุโครงการ'}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
            แก้ไขข้อมูลทีม
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* รายละเอียดโครงการ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" /> รายละเอียดโครงการ
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[80px]">
              {team.description || 'ยังไม่มีรายละเอียดโครงการ'}
            </p>
          </div>

          {/* สมาชิกในทีม */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> สมาชิกในทีม ({members.length} คน)
              </h3>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">+ เพิ่มสมาชิก</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${member.isLeader ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-white'} flex items-start gap-4 hover:shadow-md transition-shadow`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${member.color || 'bg-gray-400'}`}>
                    {member.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{member.name}</h4>
                      {member.isLeader && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] rounded-md font-bold">หัวหน้า</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Mail size={12} /> {member.email || 'ไม่ระบุ'}
                    </p>
                  </div>
                </div>
              ))}
              {members.length === 0 && <p className="text-sm text-gray-400 col-span-2">ยังไม่มีสมาชิกในทีม</p>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* กิจกรรมที่เข้าร่วม */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 border-b border-gray-50 pb-3 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> กิจกรรมที่เข้าร่วม
            </h3>
            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
              <p className="font-bold text-amber-800 text-sm mb-2">{team.event || 'ไม่ระบุกิจกรรม'}</p>
              <div className="flex items-center gap-2 text-xs text-amber-600/80">
                <Calendar size={14} /> เข้าร่วมโครงการ
              </div>
            </div>
          </div>

          {/* เอกสารของทีม */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-gray-500" /> เอกสารของทีม ({teamDocs.length})
              </h3>
            </div>
            <div className="space-y-3">
              {teamDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <FileText size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-blue-600 shrink-0 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              ))}
              {teamDocs.length === 0 && <p className="text-xs text-gray-400">ยังไม่มีเอกสาร</p>}
            </div>
            <button className="w-full mt-4 py-2 border border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors">
              + อัปโหลดเอกสารใหม่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;