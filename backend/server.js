// ไฟล์: server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

// นำเข้า Routes ที่เราหั่นไว้
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes'); // มีบรรทัดนี้ไหม?

// เสียบปลั๊ก Routes เข้ากับเส้นทางหลัก
app.use('/api/dashboard-data', dashboardRoutes);
app.use('/api/activities', activityRoutes);
// เสียบปลั๊กแยกสำหรับ events dropdown เพื่อให้ URL ตรงกับหน้าเว็บเดิมของคุณเป๊ะๆ
app.use('/api/events', activityRoutes); 
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes); // และมีบรรทัดนี้ไหม?

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});