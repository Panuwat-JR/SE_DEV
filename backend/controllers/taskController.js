// ไฟล์: controllers/taskController.js
// ตารางและคอลัมน์ตาม se.sql มาตรฐาน
const pool = require('../config/db');

/** คืน YYYY-MM-DD หรือ null — รองรับ ISO, DD/MM/YY(YY), และข้อความ placeholder */
/** แมปค่าจากฟอร์ม (ไทย / slug) → slug ใน priority_levels */
function resolvePrioritySlug(raw) {
  const s = String(raw || '').trim().toLowerCase();
  const th = String(raw || '').trim();
  const map = {
    urgent: 'urgent',
    เร่งด่วนที่สุด: 'urgent',
    high: 'high',
    สูง: 'high',
    medium: 'medium',
    กลาง: 'medium',
    ปกติ: 'medium',
    low: 'low',
    ต่ำ: 'low',
  };
  if (map[th] != null) return map[th];
  if (map[s] != null) return map[s];
  return null;
}

/** คืน priority_id จาก slug หรือชื่อที่ตรงกับตาราง */
async function lookupPriorityId(client, raw) {
  const trimmed = String(raw ?? '').trim();
  const slug = resolvePrioritySlug(trimmed);
  if (slug) {
    const bySlug = await client.query(
      `SELECT priority_id FROM priority_levels WHERE LOWER(TRIM(BOTH FROM slug)) = LOWER(TRIM(BOTH FROM $1::text)) LIMIT 1`,
      [slug]
    );
    if (bySlug.rowCount > 0) return bySlug;
  }
  if (trimmed) {
    const byName = await client.query(
      `SELECT priority_id FROM priority_levels WHERE TRIM(name) = TRIM($1) LIMIT 1`,
      [trimmed]
    );
    if (byName.rowCount > 0) return byName;
  }
  return { rowCount: 0, rows: [] };
}

/** ป้ายหมวดในฟอร์ม → slug ใน task_categories (รองรับ DB แบบ mock / seed) */
const CATEGORY_LABEL_TO_SLUG = {
  ทั่วไป: 'general',
  ประสานงาน: 'prep',
  สถานที่: 'prep',
  เอกสาร: 'summary',
  การตลาด: 'pr',
  โลจิสติกส์: 'event',
  อื่นๆ: 'general',
  อย่างอื่น: 'general',
};

async function lookupCategoryId(client, raw) {
  const name = String(raw ?? '').trim();
  if (name) {
    const exact = await client.query(
      `SELECT task_category_id FROM task_categories WHERE TRIM(name) = TRIM($1) LIMIT 1`,
      [name]
    );
    if (exact.rowCount > 0) return exact;
  }
  const slugHint = name ? CATEGORY_LABEL_TO_SLUG[name] : null;
  if (slugHint) {
    const bySlug = await client.query(
      `SELECT task_category_id FROM task_categories WHERE LOWER(TRIM(BOTH FROM slug)) = LOWER(TRIM(BOTH FROM $1::text)) LIMIT 1`,
      [slugHint]
    );
    if (bySlug.rowCount > 0) return bySlug;
  }
  const general = await client.query(
    `SELECT task_category_id FROM task_categories WHERE LOWER(TRIM(BOTH FROM slug)) = 'general' LIMIT 1`
  );
  if (general.rowCount > 0) return general;
  const first = await client.query(
    `SELECT task_category_id FROM task_categories ORDER BY task_category_id ASC LIMIT 1`
  );
  return first;
}

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
        t.event_id,
        t.task_name AS title,
        COALESCE(e.title, 'ไม่ระบุกิจกรรม') AS event,
        CASE
          WHEN ts.name = 'กำลังทำ' OR ts.name = 'กำลังดำเนินการ' THEN 'กำลังดำเนินการ'
          ELSE COALESCE(ts.name, 'รอดำเนินการ')
        END AS status,
        COALESCE(t.progress_percent, 0) AS progress,
        COALESCE(pl.name, 'ปกติ') AS priority,
        COALESCE(NULLIF(TRIM(pl.slug), ''), 'medium') AS priority_slug,
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
    const pr = await lookupPriorityId(pool, priority);
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
    let st = await pool.query(
      `SELECT status_task_id FROM task_statuses WHERE name = $1 OR slug = $1 LIMIT 1`,
      [status]
    );
    if (st.rowCount === 0) {
      st = await pool.query(
        `SELECT status_task_id FROM task_statuses WHERE slug IN ('pending','in_progress') ORDER BY status_task_id ASC LIMIT 1`
      );
    }
    if (st.rowCount === 0) {
      return res.status(400).json({ error: 'ไม่พบสถานะงานในระบบ — รัน seed / init DB' });
    }

    let pr = await lookupPriorityId(pool, priority);
    if (pr.rowCount === 0) {
      pr = await pool.query(
        `SELECT priority_id FROM priority_levels WHERE LOWER(TRIM(BOTH FROM slug)) = 'medium' LIMIT 1`
      );
    }
    if (pr.rowCount === 0) {
      pr = await pool.query(`SELECT priority_id FROM priority_levels ORDER BY priority_id ASC LIMIT 1`);
    }
    if (pr.rowCount === 0) {
      return res.status(400).json({ error: 'ไม่พบระดับความสำคัญในระบบ — รัน seed / init DB' });
    }

    let ct = await lookupCategoryId(pool, category || 'ทั่วไป');
    if (ct.rowCount === 0) {
      return res.status(400).json({ error: 'ไม่พบหมวดงานในระบบ — รัน seed / init DB' });
    }

    const evId =
      event_id === '' || event_id == null ? null : parseInt(String(event_id), 10);
    const eventIdFinal = Number.isFinite(evId) ? evId : null;

    const query = `
      INSERT INTO tasks (task_name, event_id, status_task_id, priority_id, task_category_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6::date)
    `;
    const finalDate = parseTaskDueDate(due_date);
    await pool.query(query, [
      title,
      eventIdFinal,
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