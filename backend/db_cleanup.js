const pool = require('./config/db');

async function cleanup() {
    try {
        console.log('Starting DB Cleanup...');
        
        // 1. Trim slugs in task_statuses
        await pool.query("UPDATE task_statuses SET slug = TRIM(slug)");
        console.log('✅ task_statuses slugs trimmed');
        
        // 2. Trim slugs in priority_levels
        await pool.query("UPDATE priority_levels SET slug = TRIM(slug)");
        console.log('✅ priority_levels slugs trimmed');
        
        // 3. Trim slugs in status_events
        await pool.query("UPDATE status_events SET slug = TRIM(slug)");
        console.log('✅ status_events slugs trimmed');
        
        // 4. Update Task 12 correctly now
        await pool.query("UPDATE tasks SET status_task_id = (SELECT status_task_id FROM task_statuses WHERE slug = 'completed') WHERE task_id = 12");
        console.log('✅ Task 12 updated to COMPLETED');
        
        // 5. Update Task 15 priority (just to be sure)
        await pool.query("UPDATE tasks SET priority_id = (SELECT priority_id FROM priority_levels WHERE slug = 'high') WHERE task_id = 15");
        console.log('✅ Task 15 priority ensured as HIGH');

    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
    } finally {
        pool.end();
    }
}

cleanup();
