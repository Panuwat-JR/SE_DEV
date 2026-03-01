// ไฟล์: controllers/taskController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
const pool = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const query = `
      SELECT
        t.task_id AS id,
        t.task_name AS title,
        COALESCE(e.title, 'ไม่ระบุกิจกรรม') AS event,
        CASE
          WHEN ts.name = 'กำลังทำ' OR ts.name = 'กำลังดำเนินการ' THEN 'กำลังดำเนินการ'
          ELSE COALESCE(ts.name, 'รอดำเนินการ')
        END AS status,
        COALESCE(t.progress_percent, 0) AS progress,
        COALESCE(pl.name, 'ปกติ') AS priority,
        COALESCE(TO_CHAR(t.due_date, 'DD/MM/YY'), 'ไม่ระบุวันที่') AS date,
        COALESCE(tc.name, 'ทั่วไป') AS category
      FROM tasks t
      LEFT JOIN events e ON t.event_id = e.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      LEFT JOIN task_categories tc ON t.task_category_id = tc.task_category_id
      ORDER BY t.task_id DESC
    `;
    const result = await pool.query(query);
    const tasksWithAssignees = result.rows.map(task => ({ ...task, assignees: ['ส'] }));
    res.json(tasksWithAssignees);
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงาน:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, event_id, status, priority, category, due_date } = req.body;
    const query = `
      INSERT INTO tasks (task_name, event_id, status_task_id, priority_id, task_category_id, due_date)
      VALUES (
        $1, $2,
        (SELECT status_task_id FROM task_statuses WHERE name = $3 LIMIT 1),
        (SELECT priority_id FROM priority_levels WHERE name = $4 LIMIT 1),
        (SELECT task_category_id FROM task_categories WHERE name = $5 LIMIT 1),
        $6
      )
    `;
    const finalDate = due_date ? due_date : null;
    await pool.query(query, [title, event_id || null, status, priority, category, finalDate]);
    res.json({ message: 'บันทึกงานสำเร็จ' });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึกงาน:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};