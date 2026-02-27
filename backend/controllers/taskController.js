// ไฟล์: controllers/taskController.js
const pool = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const query = `
      SELECT t.task_id AS id, t.title, COALESCE(e.event_name, 'ไม่ระบุกิจกรรม') AS event,
      CASE WHEN ts.name = 'กำลังทำ' THEN 'กำลังดำเนินการ' ELSE COALESCE(ts.name, 'รอดำเนินการ') END AS status,
      CASE WHEN ts.name = 'เสร็จสิ้น' THEN 100 WHEN ts.name = 'กำลังทำ' THEN 50 ELSE 0 END AS progress,
      COALESCE(pl.name, 'ปกติ') AS priority, COALESCE(TO_CHAR(t.due_date, 'DD/MM/YY'), 'ไม่ระบุวันที่') AS date, COALESCE(tc.name, 'ทั่วไป') AS category
      FROM Task t LEFT JOIN Event e ON t.event_id = e.event_id LEFT JOIN Task_status ts ON t.task_status_id = ts.task_status_id 
      LEFT JOIN Priority_level pl ON t.priority_level_id = pl.priority_level_id LEFT JOIN Task_category tc ON t.task_category_id = tc.task_category_id
      ORDER BY t.task_id DESC
    `;
    const result = await pool.query(query);
    const tasksWithAssignees = result.rows.map(task => ({ ...task, assignees: ['ส'] }));
    res.json(tasksWithAssignees);
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลงาน:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, event_id, status, priority, category, due_date } = req.body;
    const query = `
      INSERT INTO Task (title, event_id, task_status_id, priority_level_id, task_category_id, due_date) 
      VALUES ($1, $2, (SELECT task_status_id FROM Task_status WHERE name = $3 LIMIT 1),
      (SELECT priority_level_id FROM Priority_level WHERE name = $4 LIMIT 1), (SELECT task_category_id FROM Task_category WHERE name = $5 LIMIT 1), $6)
    `;
    const finalDate = due_date ? due_date : null; 
    await pool.query(query, [title, event_id || null, status, priority, category, finalDate]);
    res.json({ message: "บันทึกงานสำเร็จ" });
  } catch (err) {
    console.error("เกิดข้อผิดพลาดในการบันทึกงาน:", err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};