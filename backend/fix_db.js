const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://nuseed:nuseed@127.0.0.1:55432/nuseed'
});

async function fixDb() {
  try {
    console.log('--- Cleaning up task_statuses and priority_levels ---');
    
    // Fix typos in task_statuses slugs
    const resStatus = await pool.query(`
      UPDATE task_statuses 
      SET slug = 'in_progress' 
      WHERE TRIM(slug) IN ('in_progre ess', 'in_progress')
      RETURNING *
    `);
    console.log(`Updated ${resStatus.rowCount} status rows.`);

    // Fix typos in priority_levels slugs
    const resPriority = await pool.query(`
      UPDATE priority_levels 
      SET slug = 'medium' 
      WHERE TRIM(slug) IN ('medi       ium', 'medium')
      RETURNING *
    `);
    console.log(`Updated ${resPriority.rowCount} priority rows.`);

    // Just to be safe, trim all slugs in these tables
    await pool.query("UPDATE task_statuses SET slug = TRIM(slug)");
    await pool.query("UPDATE priority_levels SET slug = TRIM(slug)");
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

fixDb();
