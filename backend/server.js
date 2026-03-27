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

// เสียบปลั๊ก Routes เข้ากับเส้นทางหลัก
app.use('/api/dashboard-data', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/participants-data', participantRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});