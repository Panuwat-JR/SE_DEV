const pool = require('./config/db');

async function seedActivities() {
  try {
    console.log('Running activities seed...');

    // 1. Add max_participants and current_participants columns if they don't exist
    await pool.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS max_participants INT DEFAULT 100,
      ADD COLUMN IF NOT EXISTS current_participants INT DEFAULT 0;
    `);

    // 2. Clear existing events for a clean state
    await pool.query('DELETE FROM tasks'); // Depend on events
    await pool.query('DELETE FROM teams'); // Depend on events
    await pool.query('DELETE FROM events');

    // Make sure we have the statuses
    const statuses = ['เปิดรับสมัคร', 'วางแผน', 'กำลังดำเนินการ', 'ดำเนินการสำเร็จ', 'เสร็จสิ้น'];
    for (const st of statuses) {
      const existing = await pool.query('SELECT status_event_id FROM status_events WHERE name = $1 LIMIT 1', [st]);
      if (existing.rows.length === 0) {
        await pool.query('INSERT INTO status_events (name) VALUES ($1)', [st]);
      }
    }

    // 3. Insert specific events to match INITIAL_EVENTS
    const events = [
      { 
        title: 'Thailand ICT Awards (TICTA)', 
        status: 'เปิดรับสมัคร', 
        date_str: '2026-10-15', 
        max_p: 100, 
        cur_p: 45, 
        prize: 100000.00 
      },
      { 
        title: 'NU SEED Grant', 
        status: 'ดำเนินการสำเร็จ', 
        date_str: '2026-08-20', 
        max_p: 50, 
        cur_p: 50, 
        prize: 200000.00 
      },
      { 
        title: 'Startup Thailand League', 
        status: 'กำลังดำเนินการ', 
        date_str: '2026-11-10', 
        max_p: 200, 
        cur_p: 120, 
        prize: 500000.00 
      },
      { 
        title: 'Research to Market (R2M)', 
        status: 'เปิดรับสมัคร', 
        date_str: '2026-12-01', 
        max_p: 80, 
        cur_p: 15, 
        prize: 50000.00 
      },
      { 
        title: 'Hackathon 2026', 
        status: 'วางแผน', 
        date_str: '2027-02-15', 
        max_p: 150, 
        cur_p: 0, 
        prize: 300000.00 
      }
    ];

    for (const e of events) {
      // get status id
      const stRes = await pool.query('SELECT status_event_id FROM status_events WHERE name=$1 LIMIT 1', [e.status]);
      const status_id = stRes.rows.length > 0 ? stRes.rows[0].status_event_id : null;

      await pool.query(`
        INSERT INTO events (title, event_start_date, status_event_id, max_participants, current_participants, prize_pool)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [e.title, e.date_str, status_id, e.max_p, e.cur_p, e.prize]);
    }

    console.log('✅ Activities Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

seedActivities();
