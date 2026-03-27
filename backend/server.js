// ไฟล์: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์ที่อัปโหลดไว้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// นำเข้า Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const participantRoutes = require('./routes/participantRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const participantAdminRoutes = require('./routes/participantAdminRoutes');
const documentListRoutes = require('./routes/documentListRoutes');
const authRoutes = require('./routes/authRoutes');

// เสียบปลั๊ก Routes เข้ากับเส้นทางหลัก
app.use('/api/auth', authRoutes);
app.use('/api/dashboard-data', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/participants-data', participantRoutes);
app.use('/api/participants-admin', participantAdminRoutes);
app.use('/api/documents', documentListRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});