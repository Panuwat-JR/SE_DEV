const path = require('path');
const pool = require('./config/db');

async function runSeed() {
  try {
    console.log('Running robust employee seed...');
    
    // Clear existing mock data to prevent duplicates
    await pool.query('DELETE FROM employees');
    await pool.query('DELETE FROM employee_profiles');
    await pool.query('DELETE FROM employee_roles');
    // Note: If departments are used elsewhere this might fail due to FK. 
    // We can just try to delete them, but better to just use DO NOTHING logic properly or check if exists
    
    // Roles
    const roles = [
      { name: 'ผู้จัดการโครงการ', desc: 'รับผิดชอบการบริหารและดูแลโครงการ' },
      { name: 'นักวิเคราะห์', desc: 'วิเคราะห์ข้อมูลและวิจัย' },
      { name: 'ผู้ประสานงาน', desc: 'ประสานงานระหว่างหน่วยงาน' },
      { name: 'เจ้าหน้าที่การเงิน', desc: 'ดูแลการเงินและบัญชี' },
      { name: 'ผู้จัดการทีม', desc: 'บริหารจัดการทีม' }
    ];
    
    for (const r of roles) {
      const res = await pool.query('SELECT role_employee_id FROM employee_roles WHERE name=$1', [r.name]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO employee_roles(name, description) VALUES($1, $2)', [r.name, r.desc]);
      }
    }
    
    // Departments
    const depts = [
      { name: 'ฝ่ายโครงการ', desc: 'หน่วยงานดูแลโครงการ', slug: 'project' },
      { name: 'ฝ่ายวิจัย', desc: 'หน่วยงานวิจัยและพัฒนา', slug: 'research' },
      { name: 'ฝ่ายปฏิบัติการ', desc: 'หน่วยงานปฏิบัติการ', slug: 'operations' },
      { name: 'ฝ่ายการเงิน', desc: 'หน่วยงานการเงินและบัญชี', slug: 'finance' }
    ];
    
    for (const d of depts) {
      const res = await pool.query('SELECT department_id FROM departments WHERE name=$1', [d.name]);
      if (res.rows.length === 0) {
        await pool.query('INSERT INTO departments(name, description, slug) VALUES($1, $2, $3)', [d.name, d.desc, d.slug]);
      }
    }
    
    // Profiles + Employees
    const emps = [
      { first: 'สมชาย', last: 'สมศรี', gender: 'ชาย', role: 'ผู้จัดการโครงการ', dept: 'ฝ่ายโครงการ', email: 'somchai@se.dev', status: 'online' },
      { first: 'วิไลวรรณ', last: 'สุขใจ', gender: 'หญิง', role: 'นักวิเคราะห์', dept: 'ฝ่ายวิจัย', email: 'wilaiwan@se.dev', status: 'offline' },
      { first: 'อนุชา', last: 'รักษา', gender: 'ชาย', role: 'ผู้ประสานงาน', dept: 'ฝ่ายปฏิบัติการ', email: 'anucha@se.dev', status: 'online' },
      { first: 'นิภา', last: 'ศรีสุข', gender: 'หญิง', role: 'เจ้าหน้าที่การเงิน', dept: 'ฝ่ายการเงิน', email: 'nipa@se.dev', status: 'online' },
      { first: 'กานดา', last: 'มณีรัตน์', gender: 'หญิง', role: 'ผู้จัดการทีม', dept: 'ฝ่ายโครงการ', email: 'kanda@se.dev', status: 'offline' }
    ];
    
    for (const e of emps) {
      // Get role id & dept id
      const r_res = await pool.query('SELECT role_employee_id FROM employee_roles WHERE name=$1 LIMIT 1', [e.role]);
      const d_res = await pool.query('SELECT department_id FROM departments WHERE name=$1 LIMIT 1', [e.dept]);
      const r_id = r_res.rows[0].role_employee_id;
      const d_id = d_res.rows[0].department_id;
      
      // Insert profile if not exists
      let profile_id;
      const p_res = await pool.query('SELECT employee_profile_id FROM employee_profiles WHERE first_name=$1 AND last_name=$2', [e.first, e.last]);
      
      if (p_res.rows.length === 0) {
        const insert_p = await pool.query(
          'INSERT INTO employee_profiles(role_employee_id, department_id, first_name, last_name, gender) VALUES($1, $2, $3, $4, $5) RETURNING employee_profile_id',
          [r_id, d_id, e.first, e.last, e.gender]
        );
        profile_id = insert_p.rows[0].employee_profile_id;
      } else {
        profile_id = p_res.rows[0].employee_profile_id;
      }
      
      // Insert employee account
      const hash = '$2b$10$X9kl7g/.example.hash.placeholder.for.demo.only';
      const c_res = await pool.query('SELECT employee_id FROM employees WHERE email=$1', [e.email]);
      
      if (c_res.rows.length === 0) {
        await pool.query(
          'INSERT INTO employees(employee_profile_id, email, password_hash, status, online_status) VALUES($1, $2, $3, $4, $5)',
          [profile_id, e.email, hash, 'active', e.status]
        );
      } else {
        // Update online status
        await pool.query(
          'UPDATE employees SET online_status=$1 WHERE email=$2',
          [e.status, e.email]
        );
      }
    }
    
    console.log('✅ Mock Employees Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runSeed();
