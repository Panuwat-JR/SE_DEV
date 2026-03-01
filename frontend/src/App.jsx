import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// ── Login ──────────────────────────────────────────────
import Login from './pages/Login';

// ── Participant pages ──────────────────────────────────
import ParticipantLayout from './layouts/ParticipantLayout';
import P_Dashboard from './pages/participant/P_Dashboard';
import P_ProjectDetail from './pages/participant/P_ProjectDetail';
import P_Documents from './pages/participant/P_Documents';
import P_Team from './pages/participant/P_Team';
import P_Notifications from './pages/participant/P_Notifications';
import P_Contact from './pages/participant/P_Contact';
import P_Calendar from './pages/participant/P_Calendar';
import P_Feedback from './pages/participant/P_Feedback';

// ── Employee pages ─────────────────────────────────────
import EmployeeLayout from './layouts/EmployeeLayout';
import E_Dashboard from './pages/employee/E_Dashboard';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Participants from './pages/Participants';
import E_Documents from './pages/employee/E_Documents';
import E_Calendar from './pages/employee/E_Calendar';

// ── Executive pages ────────────────────────────────────
import ExecutiveLayout from './layouts/ExecutiveLayout';
import X_Dashboard from './pages/executive/X_Dashboard';
import X_Feedback from './pages/executive/X_Feedback';

// ── Route Guard ────────────────────────────────────────
const RequireRole = ({ allowed, children }) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── PARTICIPANT workspace ── */}
        <Route path="/participant" element={
          <RequireRole allowed={['participant']}>
            <ParticipantLayout />
          </RequireRole>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P_Dashboard />} />
          <Route path="projects/:id" element={<P_ProjectDetail />} />
          <Route path="documents" element={<P_Documents />} />
          <Route path="team" element={<P_Team />} />
          <Route path="notifications" element={<P_Notifications />} />
          <Route path="contact" element={<P_Contact />} />
          <Route path="calendar" element={<P_Calendar />} />
          <Route path="feedback" element={<P_Feedback />} />
        </Route>

        {/* ── EMPLOYEE workspace ── */}
        <Route path="/employee" element={
          <RequireRole allowed={['employee']}>
            <EmployeeLayout />
          </RequireRole>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<E_Dashboard />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/:id" element={<ActivityDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id" element={<TeamDetail />} />
          <Route path="participants" element={<Participants />} />
          <Route path="documents" element={<E_Documents />} />
          <Route path="calendar" element={<E_Calendar />} />
        </Route>

        {/* ── EXECUTIVE workspace ── */}
        <Route path="/executive" element={
          <RequireRole allowed={['executive']}>
            <ExecutiveLayout />
          </RequireRole>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<X_Dashboard />} />
          <Route path="feedback" element={<X_Feedback />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;