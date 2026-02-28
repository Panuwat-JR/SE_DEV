import React, { useState } from 'react';
import { User, Bell, Shield, Palette, Database, Save } from 'lucide-react';

const Settings = () => {
  // สร้าง State สำหรับเก็บว่าตอนนี้เลือกเมนูไหนอยู่ (เริ่มต้นที่ โปรไฟล์)
  const [activeTab, setActiveTab] = useState('profile');

  // ข้อมูลเมนูตั้งค่า
  const menuItems = [
    { id: 'profile', name: 'โปรไฟล์', icon: <User size={18} /> },
    { id: 'notifications', name: 'การแจ้งเตือน', icon: <Bell size={18} /> },
    { id: 'security', name: 'ความปลอดภัย', icon: <Shield size={18} /> },
    { id: 'theme', name: 'ธีมและการแสดงผล', icon: <Palette size={18} /> },
    { id: 'backup', name: 'ข้อมูลและสำรอง', icon: <Database size={18} /> },
  ];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ตั้งค่า</h1>
        <p className="text-gray-500 text-sm">จัดการการตั้งค่าระบบและบัญชีผู้ใช้</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* เมนูตั้งค่าด้านซ้าย */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/20'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* พื้นที่แก้ไขข้อมูลด้านขวา (แสดงเฉพาะเมื่อเลือก 'profile') */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">โปรไฟล์</h2>
              
              {/* ส่วนเปลี่ยนรูปภาพ */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <User size={32} className="text-gray-300" />
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors mb-2">
                    เปลี่ยนรูปภาพ
                  </button>
                  <p className="text-[11px] text-gray-400">JPG, PNG ขนาดไม่เกิน 2MB</p>
                </div>
              </div>

              {/* ฟอร์มข้อมูล */}
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ชื่อ</label>
                    <input 
                      type="text" 
                      defaultValue="อนุชา"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">นามสกุล</label>
                    <input 
                      type="text" 
                      defaultValue="สมศรี"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">อีเมล</label>
                    <input 
                      type="email" 
                      defaultValue="anucha@nuseed.ac.th"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-600 bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                    <input 
                      type="text" 
                      defaultValue="081-234-5678"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ตำแหน่ง</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none">
                    <option>เจ้าหน้าที่บริหารทั่วไป</option>
                    <option>ผู้จัดการโครงการ</option>
                    <option>ผู้อำนวยการ</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button type="button" className="bg-[#2563eb] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Save size={18} />
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* เผื่อไว้สำหรับแท็บอื่นๆ ในอนาคต */}
          {activeTab !== 'profile' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center h-[400px]">
              <p className="text-gray-400">กำลังพัฒนาระบบในส่วนนี้...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;