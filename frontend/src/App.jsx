import React from 'react';
// นำเข้าเครื่องมือสลับหน้า
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// นำเข้าชิ้นส่วนที่เราแยกไว้
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Teams from './pages/Teams'; // (แก้โฟลเดอร์ให้ตรงกับที่คุณเซฟไฟล์ไว้ เช่น './components/Teams' ถ้าคุณไว้ใน components)
import Participants from './pages/Participants';
import Employees from './pages/Employees';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import DocumentDetail from './pages/DocumentDetail';
import TeamDetail from './pages/TeamDetail';
function App() {
  return (
    // <BrowserRouter> คือการเปิดใช้งานระบบ Routing
    <BrowserRouter>
      <div className="flex h-screen bg-[#f8fafc] font-sans">
        
        {/* เอา Sidebar มาประกอบไว้ด้านซ้าย */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* เอา Header มาประกอบไว้ด้านบน */}
          <Header />

          {/* พื้นที่ตรงกลาง เอาไว้สลับหน้าจอ (Routes) */}
          <main className="flex-1 overflow-y-auto p-8 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/:id" element={<ActivityDetail />} /> 
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/participants" element={<Participants />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/settings" element={<Settings />} />
              
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;