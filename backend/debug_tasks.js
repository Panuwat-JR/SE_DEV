const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://nuseed:nuseed@127.0.0.1:55432/nuseed'
});

async function checkTasks() {
  try {
    const res = await pool.query(`
      SELECT 
        t.task_id, 
        t.task_name, 
        t.due_date, 
        ts.name as status_name, 
        ts.slug as status_slug,
        pl.name as priority_name,
        pl.slug as priority_slug,
        e.title as event_title
      FROM tasks t
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      LEFT JOIN events e ON t.event_id = e.event_id
      WHERE e.title = 'NU SEED Innovation Challenge 2026'
    `);
    console.log('--- Tasks for NU SEED Innovation Challenge 2026 ---');
    console.table(res.rows);

    const urgentRes = await pool.query(`
      SELECT 
        t.task_id         AS id,
        t.task_name       AS name,
        COALESCE(ev.title, 'ไม่ระบุ') AS project,
        pl.name           AS priority,
        COALESCE(
          CASE
            WHEN t.due_date IS NULL THEN 'ไม่ระบุ'
            WHEN t.due_date::date < CURRENT_DATE THEN 'เลยกำหนด'
            WHEN t.due_date::date = CURRENT_DATE       THEN 'วันนี้'
            WHEN t.due_date::date = CURRENT_DATE + 1   THEN 'พรุ่งนี้'
            ELSE TO_CHAR(t.due_date, 'DD/MM/YYYY')
          END, 'ไม่ระบุ'
        ) AS deadline,
        t.event_id,
        mee.employee_id
      FROM tasks t
      INNER JOIN mapping_event_employees mee ON mee.event_id = t.event_id AND mee.employee_id = 1
      LEFT JOIN events        ev ON t.event_id    = ev.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      WHERE COALESCE(TRIM(ts.slug), '') <> 'completed'
      AND (
        LOWER(TRIM(BOTH FROM COALESCE(pl.slug, ''))) IN ('high', 'urgent')
        OR (
          t.due_date IS NOT NULL
          AND t.due_date::date <= (CURRENT_DATE + INTERVAL '7 days')
        )
      )
      ORDER BY t.due_date NULLS LAST, t.task_id ASC
      LIMIT 8
    `);
    console.log('\n--- Urgent Tasks for Employee ID 1 ---');
    console.table(urgentRes.rows);

    const empRes = await pool.query(`
      SELECT e.employee_id, ep.first_name, ep.last_name, e.email
      FROM employees e
      JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
      WHERE ep.first_name LIKE '%สมชาย%'
    `);
    console.log('\n--- Employees matching Somchai ---');
    console.table(empRes.rows);

    const allEvents = await pool.query(`
      SELECT event_id, title FROM events
    `);
    console.log('\n--- All Events ---');
    console.table(allEvents.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkTasks();
