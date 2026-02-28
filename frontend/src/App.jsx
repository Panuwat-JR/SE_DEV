import React from 'react';
// 1. เพิ่ม useLocation เข้ามาในบรรทัดนี้
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 2. นำเข้า Components (ลบอันที่ซ้ำออกแล้ว)
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// นำเข้า Pages ทั้งหมด
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Teams from './pages/Teams'; 
import TeamDetail from './pages/TeamDetail';
import Participants from './pages/Participants';
import Employees from './pages/Employees';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Settings from './pages/Settings';
import CalendarView from './pages/CalendarView';
import Login from './pages/Login'; 

// สร้าง Component ย่อยเพื่อคุม Layout (เปิด/ปิด Sidebar)
const MainLayout = ({ children }) => {
  const location = useLocation();
  // ถ้าพาทปัจจุบันคือ /login ให้โชว์แค่เนื้อหาเพียวๆ ไม่เอา Sidebar
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <div className="w-full h-screen bg-gray-50">{children}</div>;
  }

  // ถ้าเป็นหน้าอื่นๆ ให้แสดง Sidebar และ Header ตามปกติ
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* ใส่ Padding p-8 ไว้ตรงนี้ เพื่อให้ทุกหน้ามีระยะห่างขอบเท่ากัน */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    // <BrowserRouter> คือการเปิดใช้งานระบบ Routing
    <BrowserRouter>
      {/* 3. เรียกใช้ MainLayout ครอบ Routes เอาไว้เลย (ไม่ต้องใส่ Sidebar/Header ตรงนี้แล้ว) */}
      <MainLayout>
        <Routes>
          {/* หน้า Login */}
          <Route path="/login" element={<Login />} />
          
          {/* หน้าอื่นๆ */}
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
          <Route path="/calendar" element={<CalendarView />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;