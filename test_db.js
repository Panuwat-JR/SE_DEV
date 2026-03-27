const pool = require('./backend/config/db');
(async () => {
  try {
    const res = await pool.query('SELECT 1 AS ok');
    console.log('DB connection successful:', res.rows);
  } catch (err) {
    console.error('DB connection error:', err.message);
  } finally {
    await pool.end();
  }
})();
