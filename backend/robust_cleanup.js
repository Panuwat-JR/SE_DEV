const pool = require('./config/db');

async function robustCleanup() {
    try {
        console.log('Starting Robust DB Cleanup & Deduplication...');

        // Function to deduplicate a table based on slug
        async function deduplicate(tableName, idColumn, slugColumn) {
            console.log(`Deduplicating ${tableName}...`);
            await pool.query(`UPDATE ${tableName} SET ${slugColumn} = TRIM(${slugColumn})`);
            
            const result = await pool.query(`
                SELECT ${slugColumn}, array_agg(${idColumn} ORDER BY ${idColumn}) as ids 
                FROM ${tableName} 
                GROUP BY ${slugColumn} 
                HAVING COUNT(*) > 1
            `);
            
            for (const row of result.rows) {
                const keepId = row.ids[0];
                const removeIds = row.ids.slice(1);
                console.log(`  - Merging duplicate slug '${row.slug}': keeping ID ${keepId}, removing IDs ${removeIds.join(',')}`);
                
                // Update dependent tables (this is a bit manual since we don't know all FKs)
                if (tableName === 'priority_levels') {
                    await pool.query(`UPDATE tasks SET priority_id = $1 WHERE priority_id = ANY($2)`, [keepId, removeIds]);
                } else if (tableName === 'task_statuses') {
                    await pool.query(`UPDATE tasks SET status_task_id = $1 WHERE status_task_id = ANY($2)`, [keepId, removeIds]);
                } else if (tableName === 'status_events') {
                    await pool.query(`UPDATE events SET status_event_id = $1 WHERE status_event_id = ANY($2)`, [keepId, removeIds]);
                }
                
                await pool.query(`DELETE FROM ${tableName} WHERE ${idColumn} = ANY($1)`, [removeIds]);
            }
        }

        await deduplicate('task_statuses', 'status_task_id', 'slug');
        await deduplicate('priority_levels', 'priority_id', 'slug');
        await deduplicate('status_events', 'status_event_id', 'slug');

        // Now set Task 12 and 15
        await pool.query("UPDATE tasks SET status_task_id = (SELECT status_task_id FROM task_statuses WHERE slug = 'completed') WHERE task_id = 12");
        await pool.query("UPDATE tasks SET priority_id = (SELECT priority_id FROM priority_levels WHERE slug = 'high') WHERE task_id = 15");
        
        console.log('✅ All slugs dedicated and tasks updated!');

    } catch (err) {
        console.error('❌ Robust Cleanup failed:', err.message);
    } finally {
        pool.end();
    }
}

robustCleanup();
