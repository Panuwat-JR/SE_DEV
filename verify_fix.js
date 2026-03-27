const pool = require('./backend/config/db');
const { createTask, updateTask, getTasks } = require('./backend/controllers/taskController');

// Mock req and res
const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

async function verify() {
  try {
    console.log('--- Verification: Creating Task ---');
    const createReq = {
      body: {
        task_name: 'Test Urgent Document Task',
        priority: 'เร่งด่วนที่สุด',
        category: 'เอกสาร',
        status: 'รอดำเนินการ'
      }
    };
    const createRes = mockRes();
    await createTask(createReq, createRes);
    console.log('Create Result:', createRes.body);

    if (createRes.statusCode && createRes.statusCode !== 200) {
      throw new Error(`Create failed: ${JSON.stringify(createRes.body)}`);
    }

    console.log('\n--- Verification: Checking Saved Task ---');
    const tasksRes = mockRes();
    await getTasks({}, tasksRes);
    const savedTask = tasksRes.body.find(t => t.title === 'Test Urgent Document Task');
    console.log('Saved Task Details:', savedTask);

    if (savedTask.priority !== 'เร่งด่วนที่สุด' || savedTask.category !== 'เอกสาร') {
      console.error(`Verification FAILED: Expected เร่งด่วนที่สุด/เอกสาร, got ${savedTask.priority}/${savedTask.category}`);
    } else {
      console.log('✅ Verification PASSED: Task saved correctly!');
    }

    // Cleanup
    if (savedTask && savedTask.id) {
       await pool.query('DELETE FROM tasks WHERE task_id = $1', [savedTask.id]);
       console.log('\nCleanup: Deleted test task.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

verify();
