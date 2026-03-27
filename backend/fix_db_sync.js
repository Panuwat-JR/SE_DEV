const pool = require('./config/db');

async function fix() {
    try {
        const res = await pool.query("UPDATE tasks SET status_task_id = (SELECT status_task_id FROM task_statuses WHERE slug = 'completed') WHERE task_id = 12");
        console.log('✅ Task 12 marked as COMPLETED');
        
        // Also update task 15 just so it looks very different
        await pool.query("UPDATE tasks SET progress_percent = 50 WHERE task_id = 15");
        console.log('✅ Task 15 progress updated to 50%');
        
    } catch (err) {
        console.error('❌ Error fixing task:', err.message);
    } finally {
        pool.end();
    }
}

fix();
