const pool = require('./config/db');

async function seedTasks() {
  try {
    console.log('Running tasks seed...');

    // 1. Get event mapping
    const events = await pool.query('SELECT event_id, title FROM events');
    if (events.rows.length === 0) {
      console.log('No events found. Run seed_activities.js first.');
      return;
    }

    // 2. Get status and priority IDs
    const statuses = await pool.query('SELECT status_task_id, slug FROM task_statuses');
    const priorities = await pool.query('SELECT priority_id, slug FROM priority_levels');

    const getStatusId = (slug) => statuses.rows.find(s => s.slug === slug)?.status_task_id;
    const getPriorityId = (slug) => priorities.rows.find(p => p.slug === slug)?.priority_id;

    const pendingId = getStatusId('pending');
    const inProgressId = getStatusId('in_progress');
    const highId = getPriorityId('high');
    const urgentId = getPriorityId('urgent');
    const mediumId = getPriorityId('medium');

    // 3. Clear existing tasks for a clean state
    await pool.query('DELETE FROM tasks');

    // 4. Insert tasks for each event
    const tasks = [
      { name: 'Prepare Presentation Slides', event_id: events.rows[0].event_id, status_id: pendingId, priority_id: highId, due: '2026-03-28' },
      { name: 'Review Budget Allocation', event_id: events.rows[1].event_id, status_id: inProgressId, priority_id: urgentId, due: '2026-03-27' },
      { name: 'Coordinate with Mentors', event_id: events.rows[2].event_id, status_id: pendingId, priority_id: highId, due: '2026-03-30' },
      { name: 'Finalize Participant List', event_id: events.rows[0].event_id, status_id: inProgressId, priority_id: highId, due: '2026-03-29' },
      { name: 'Update Social Media Promo', event_id: events.rows[3].event_id, status_id: pendingId, priority_id: mediumId, due: '2026-04-05' }
    ];

    for (const t of tasks) {
      await pool.query(`
        INSERT INTO tasks (task_name, event_id, status_task_id, priority_id, due_date)
        VALUES ($1, $2, $3, $4, $5)
      `, [t.name, t.event_id, t.status_id, t.priority_id, t.due]);
    }

    console.log('✅ Tasks Seed successful!');
  } catch (err) {
    console.error('❌ Task Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seedTasks();
