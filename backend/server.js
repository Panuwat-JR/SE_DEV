// ไฟล์: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// นำเข้า Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');

// เสียบปลั๊ก Routes เข้ากับเส้นทางหลัก
app.use('/api/dashboard-data', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/events', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});