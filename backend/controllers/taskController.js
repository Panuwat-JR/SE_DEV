// ไฟล์: controllers/taskController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
const pool = require('../config/db');

/** คืน YYYY-MM-DD หรือ null — รองรับ ISO, DD/MM/YY(YY), และข้อความ placeholder */
function parseTaskDueDate(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (!s || s === 'ไม่ระบุวันที่') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let y = parseInt(m[3], 10);
    const mo = m[2].padStart(2, '0');
    const d = m[1].padStart(2, '0');
    if (y < 100) y += 2000;
    if (y > 2500) y -= 543;
    return `${y}-${mo}-${d}`;
  }
  return null;
}

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
        CASE WHEN t.due_date IS NULL THEN NULL ELSE TO_CHAR(t.due_date, 'YYYY-MM-DD') END AS due_date_iso,
        COALESCE(tc.name, 'ทั่วไป') AS category
      FROM tasks t
      LEFT JOIN events e ON t.event_id = e.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      LEFT JOIN task_categories tc ON t.task_category_id = tc.task_category_id
      ORDER BY t.task_id DESC
    `;
    const result = await pool.query(query);
    // ยังไม่มีตารางผู้รับผิดชอบงานใน schema — ส่ง array ว่างแทนค่าปลอม
    const tasksWithAssignees = result.rows.map((task) => ({ ...task, assignees: [] }));
    res.json(tasksWithAssignees);
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลงาน:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, status, priority, due_date, progress } = req.body;
  try {
    let finalProgress = progress;
    if (status === 'เสร็จสิ้น' || status === 'completed') {
      finalProgress = 100;
    }

    const dueIso = parseTaskDueDate(due_date);

    const st = await pool.query(
      `SELECT status_task_id FROM task_statuses WHERE name = $1 OR slug = $1 LIMIT 1`,
      [status]
    );
    if (st.rowCount === 0) {
      return res.status(400).json({ error: `ไม่พบสถานะงาน "${status}" ในระบบ` });
    }
    const pr = await pool.query(
      `SELECT priority_id FROM priority_levels WHERE name = $1 OR slug = $1 LIMIT 1`,
      [priority]
    );
    if (pr.rowCount === 0) {
      return res.status(400).json({ error: `ไม่พบระดับความสำคัญ "${priority}" ในระบบ` });
    }

    const query = `
      UPDATE tasks
      SET 
        task_name = $1,
        status_task_id = $2,
        priority_id = $3,
        due_date = $4::date,
        progress_percent = $5
      WHERE task_id = $6
    `;
    const r = await pool.query(query, [
      title,
      st.rows[0].status_task_id,
      pr.rows[0].priority_id,
      dueIso,
      finalProgress || 0,
      id,
    ]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'ไม่พบงาน' });
    res.json({ message: 'อัปเดตงานสำเร็จ' });
  } catch (err) {
    console.error('updateTask Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('DELETE FROM tasks WHERE task_id = $1 RETURNING task_id', [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'ไม่พบงาน' });
    res.json({ message: 'ลบงานสำเร็จ' });
  } catch (err) {
    console.error('deleteTask Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const body = req.body || {};
    const title = String(body.title ?? body.task_name ?? '').trim();
    if (!title) {
      return res.status(400).json({ error: 'ต้องระบุชื่องาน' });
    }
    const { event_id, status, priority, category, due_date } = body;
    const priorityNorm = String(priority || '').trim() === 'กลาง' ? 'ปกติ' : priority;

    const st = await pool.query(
      `SELECT status_task_id FROM task_statuses WHERE name = $1 OR slug = $1 LIMIT 1`,
      [status]
    );
    if (st.rowCount === 0) {
      return res.status(400).json({ error: `ไม่พบสถานะงาน "${status}" ในระบบ` });
    }
    const pr = await pool.query(
      `SELECT priority_id FROM priority_levels WHERE name = $1 OR slug = $1 LIMIT 1`,
      [priorityNorm]
    );
    if (pr.rowCount === 0) {
      return res.status(400).json({ error: `ไม่พบระดับความสำคัญ "${priorityNorm}" ในระบบ` });
    }
    const catName = String(category || 'ทั่วไป').trim();
    const ct = await pool.query(
      `SELECT task_category_id FROM task_categories WHERE name = $1 LIMIT 1`,
      [catName]
    );
    if (ct.rowCount === 0) {
      return res.status(400).json({ error: `ไม่พบหมวดงาน "${catName}" ในระบบ` });
    }

    const query = `
      INSERT INTO tasks (task_name, event_id, status_task_id, priority_id, task_category_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6::date)
    `;
    const finalDate = parseTaskDueDate(due_date);
    await pool.query(query, [
      title,
      event_id || null,
      st.rows[0].status_task_id,
      pr.rows[0].priority_id,
      ct.rows[0].task_category_id,
      finalDate,
    ]);
    res.json({ message: 'บันทึกงานสำเร็จ' });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึกงาน:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};