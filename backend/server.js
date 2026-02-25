const express = require('express');
const { Pool } = require('pg');  //เรียกใช้เครื่องมือชื่อ 'pg' (Postgres)
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

// ตั้งค่าเชื่อมต่อ Database SE_DB
// ตั้งค่าเชื่อมต่อ Database ไปที่ Neon.tech (Cloud)
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2g1ivEbpOMBa@ep-bitter-sunset-a12sdisi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});
// ==========================================
// 1. API ดึงข้อมูลหน้าแดชบอร์ดและกิจกรรม 
// ==========================================
app.get('/api/dashboard-data', async (req, res) => {
  try {
    // 1. นับสถิติ
    const eventsCount = await pool.query('SELECT COUNT(*) FROM Event');
    const teamsCount = await pool.query('SELECT COUNT(*) FROM Team');
    const tasksCount = await pool.query('SELECT COUNT(*) FROM Task');
    const pendingTasksCount = await pool.query(`SELECT COUNT(*) FROM Task t JOIN Task_status ts ON t.task_status_id = ts.task_status_id WHERE ts.name = 'รอดำเนินการ'`);
    const docsCount = await pool.query(`SELECT COUNT(*) FROM Task t JOIN Task_category tc ON t.task_category_id = tc.task_category_id WHERE tc.name = 'เอกสาร'`);

    const stats = {
      total_activities: parseInt(eventsCount.rows[0].count),
      registered_teams: parseInt(teamsCount.rows[0].count),
      total_tasks: parseInt(tasksCount.rows[0].count),
      pending_tasks: parseInt(pendingTasksCount.rows[0].count),
      total_documents: parseInt(docsCount.rows[0].count),
      documents_this_month: parseInt(docsCount.rows[0].count),
      active_activities: 0 
    };

    // 2. ดึงข้อมูลกิจกรรมที่จะมาถึง
    const activitiesResult = await pool.query(`
      SELECT e.event_id AS id, e.event_name AS title, COALESCE(s.name, 'เปิดรับสมัคร') AS status, COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุวันที่') AS date_text,
      0 AS current_participants, 100 AS max_participants, COALESCE(e.prize_money, 'ยังไม่ระบุ') AS prize_money
      FROM Event e LEFT JOIN Status_event s ON e.status_event_id = s.status_event_id ORDER BY e.event_id DESC
    `);

    // 🌟 3. ดึง "งานล่าสุด" (แยกมาใส่ส่วนกล่องด้านซ้าย)
    // มีการคำนวณ Progress Bar (0, 50, 100) ตามสถานะด้วย
    const tasksResult = await pool.query(`
      SELECT 
        t.task_id AS id, 
        t.title, 
        COALESCE(e.event_name, 'ไม่ระบุกิจกรรม') AS project_name,
        COALESCE(pl.name, 'ปกติ') AS priority,
        CASE 
          WHEN ts.name = 'เสร็จสิ้น' THEN 100
          WHEN ts.name = 'กำลังทำ' THEN 50
          ELSE 0
        END AS progress_percent
      FROM Task t
      LEFT JOIN Event e ON t.event_id = e.event_id
      LEFT JOIN Task_status ts ON t.task_status_id = ts.task_status_id
      LEFT JOIN Priority_level pl ON t.priority_level_id = pl.priority_level_id
      ORDER BY t.task_id DESC
      LIMIT 3
    `);

    // 🌟 4. ดึง "กิจกรรมล่าสุด" (แยกมาใส่กล่อง Log ด้านขวา)
    // ดึงเฉพาะข้อมูลการสร้างกิจกรรม (Event) เท่านั้น
    const logsResult = await pool.query(`
      SELECT 
        'evt_' || event_id AS id, 
        'event' AS action_type, 
        'สร้างกิจกรรมใหม่' AS title, 
        event_name AS description, 
        'สมชาย สมศรี' AS user_name, 
        created_at
      FROM Event
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // ฟังก์ชันคำนวณเวลา (Time Ago)
    const formatTimeAgo = (date) => {
      if (!date) return "เมื่อสักครู่";
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      let interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " วันที่แล้ว";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " ชั่วโมงที่แล้ว";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " นาทีที่แล้ว";
      return "เมื่อสักครู่";
    };

    // แปลงเวลาให้ Log แต่ละบรรทัด
    const formattedLogs = logsResult.rows.map(log => ({
      ...log,
      time_ago: formatTimeAgo(log.created_at)
    }));

    // 5. ส่งข้อมูลแยกกันอย่างชัดเจนให้ React
    res.json({
      stats: stats,
      upcomingActivities: activitiesResult.rows,
      recentTasks: tasksResult.rows,      // 👈 ส่ง "งานล่าสุด" ไปลงกล่องซ้าย
      projectTimelines: [], 
      activityLogs: formattedLogs         // 👈 ส่ง "กิจกรรมล่าสุด" ไปลงกล่องขวา
    });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ==========================================
// 2. API รับข้อมูลกิจกรรมใหม่ (บันทึกลงตาราง Event จริง แบบครบทุกช่อง!)
// ==========================================
app.post('/api/activities', async (req, res) => {
  try {
    const { title, status, date_text, max_participants, prize_money } = req.body;
    
    // ดักไว้ก่อน: ถ้าไม่ได้เลือกวันที่มา ให้เป็น null จะได้ไม่ Error ตอนลงฐานข้อมูล (ตาราง DATE ห้ามส่งค่าว่าง '')
    const finalDate = date_text ? date_text : null;
    
    // บันทึกข้อมูลลงตาราง Event (เพิ่มวันที่ และ เงินรางวัล เข้าไปด้วย)
    // ส่วน status เราบังคับให้เป็น 'เปิดรับสมัคร' เป็นค่าเริ่มต้นไปก่อนครับ
    const result = await pool.query(
      `INSERT INTO Event (event_name, event_start_date, prize_money, status_event_id) 
       VALUES (
         $1, 
         $2, 
         $3, 
         (SELECT status_event_id FROM Status_event WHERE name = 'เปิดรับสมัคร' LIMIT 1)
       ) 
       RETURNING event_id AS id, event_name AS title`,
      [title, finalDate, prize_money]
    );
    
    res.json({ message: "บันทึกสำเร็จ", data: result.rows[0] });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการบันทึก:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ==========================================
// 3. API ดึงข้อมูลงาน (Tasks) สำหรับหน้า Kanban Board
// ==========================================
app.get('/api/tasks', async (req, res) => {
  try {
    const query = `
      SELECT 
        t.task_id AS id,
        t.title,
        COALESCE(e.event_name, 'ไม่ระบุกิจกรรม') AS event,
        -- แปลงคำว่า 'กำลังทำ' ใน DB ให้เป็น 'กำลังดำเนินการ' เพื่อให้ตรงกับหน้าเว็บ
        CASE 
          WHEN ts.name = 'กำลังทำ' THEN 'กำลังดำเนินการ'
          ELSE COALESCE(ts.name, 'รอดำเนินการ')
        END AS status,
        -- แอบคำนวณ Progress เนียนๆ จากสถานะ
        CASE 
          WHEN ts.name = 'เสร็จสิ้น' THEN 100
          WHEN ts.name = 'กำลังทำ' THEN 50
          ELSE 0
        END AS progress,
        COALESCE(pl.name, 'ปกติ') AS priority,
        COALESCE(TO_CHAR(t.due_date, 'DD/MM/YY'), 'ไม่ระบุวันที่') AS date,
        COALESCE(tc.name, 'ทั่วไป') AS category
      FROM Task t
      LEFT JOIN Event e ON t.event_id = e.event_id
      LEFT JOIN Task_status ts ON t.task_status_id = ts.task_status_id
      LEFT JOIN Priority_level pl ON t.priority_level_id = pl.priority_level_id
      LEFT JOIN Task_category tc ON t.task_category_id = tc.task_category_id
      ORDER BY t.task_id DESC
    `;
    
    const result = await pool.query(query);
    const tasksWithAssignees = result.rows.map(task => ({
      ...task,
      assignees: ['ส'] 
    }));

    res.json(tasksWithAssignees);
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลงาน:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ==========================================
// 4. API ดึงรายชื่อกิจกรรมมาใส่ใน Dropdown ให้เลือกตอนสร้างงาน
// ==========================================
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT event_id, event_name FROM Event ORDER BY event_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// ==========================================
// 5. API สร้างงานใหม่ (Create Task)
// ==========================================
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, event_id, status, priority, category, due_date } = req.body;
    
    const query = `
      INSERT INTO Task (
        title, event_id, task_status_id, priority_level_id, task_category_id, due_date
      ) VALUES (
        $1, 
        $2,
        (SELECT task_status_id FROM Task_status WHERE name = $3 LIMIT 1),
        (SELECT priority_level_id FROM Priority_level WHERE name = $4 LIMIT 1),
        (SELECT task_category_id FROM Task_category WHERE name = $5 LIMIT 1),
        $6
      )
    `;
    
    const finalDate = due_date ? due_date : null; 
    
    await pool.query(query, [title, event_id || null, status, priority, category, finalDate]);
    res.json({ message: "บันทึกงานสำเร็จ" });
    
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการบันทึกงาน:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ==========================================
// 6. API ลบกิจกรรม (Delete Event)
// ==========================================
app.delete('/api/activities/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    // 1. เคลียร์ข้อมูลลูกข่ายที่ผูกติดกับกิจกรรมนี้ทิ้งก่อน (กัน Error Foreign Key)
    await pool.query('DELETE FROM Task WHERE event_id = $1', [eventId]);
    await pool.query('DELETE FROM Team WHERE event_id = $1', [eventId]);
    await pool.query('DELETE FROM Document WHERE event_id = $1', [eventId]);
    
    // 2. ลบตัวกิจกรรมหลักออกจากตาราง Event
    await pool.query('DELETE FROM Event WHERE event_id = $1', [eventId]);
    
    res.json({ message: "ลบกิจกรรมสำเร็จ" });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการลบ:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});