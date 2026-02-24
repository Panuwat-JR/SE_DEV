import React from 'react';
// นำเข้าเครื่องมือสลับหน้า
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// นำเข้าชิ้นส่วนที่เราแยกไว้
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Tasks from './pages/Tasks';

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
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
          </main>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;