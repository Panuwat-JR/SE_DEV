// ไฟล์: services/employeeService.js
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

class EmployeeService {
  async ensureRoleId(roleName) {
    const n = String(roleName || '').trim() || 'ไม่ระบุตำแหน่ง';
    const found = await pool.query(
      'SELECT role_employee_id FROM employee_roles WHERE name = $1 LIMIT 1',
      [n]
    );
    if (found.rows[0]) return found.rows[0].role_employee_id;
    const ins = await pool.query(
      'INSERT INTO employee_roles (name, description) VALUES ($1, $2) RETURNING role_employee_id',
      [n, n]
    );
    return ins.rows[0].role_employee_id;
  }

  async ensureDepartmentId(deptName) {
    const n = String(deptName || '').trim() || 'ไม่ระบุแผนก';
    const found = await pool.query(
      'SELECT department_id FROM departments WHERE name = $1 LIMIT 1',
      [n]
    );
    if (found.rows[0]) return found.rows[0].department_id;
    const ins = await pool.query(
      'INSERT INTO departments (name, description, slug) VALUES ($1, $2, NULL) RETURNING department_id',
      [n, n]
    );
    return ins.rows[0].department_id;
  }

  async createEmployee(body) {
    const first_name = String(body.first_name || '').trim();
    const last_name = String(body.last_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!first_name || !last_name) {
      const err = new Error('ต้องระบุชื่อและนามสกุล');
      err.code = 'VALIDATION';
      throw err;
    }
    if (!email) {
      const err = new Error('ต้องระบุอีเมล');
      err.code = 'VALIDATION';
      throw err;
    }
    const gender = body.gender != null ? String(body.gender).trim() : null;
    const roleId = await this.ensureRoleId(body.role);
    const deptId = await this.ensureDepartmentId(body.department);
    const plain = String(body.password || 'password123');
    const password_hash = bcrypt.hashSync(plain, 10);
    const status = String(body.status || 'active').trim();
    const online_status = String(body.online_status || 'offline').trim();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const prof = await client.query(
        `INSERT INTO employee_profiles (role_employee_id, department_id, first_name, last_name, gender)
         VALUES ($1, $2, $3, $4, $5) RETURNING employee_profile_id`,
        [roleId, deptId, first_name, last_name, gender || null]
      );
      const profileId = prof.rows[0].employee_profile_id;
      const empIns = await client.query(
        `INSERT INTO employees (employee_profile_id, email, password_hash, status, online_status)
         VALUES ($1, $2, $3, $4, $5) RETURNING employee_id`,
        [profileId, email, password_hash, status, online_status]
      );
      await client.query('COMMIT');
      return this.getEmployeeById(empIns.rows[0].employee_id);
    } catch (e) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore */
      }
      if (e.code === '23505') {
        const err = new Error('อีเมลนี้มีในระบบแล้ว');
        err.code = 'DUPLICATE_EMAIL';
        throw err;
      }
      throw e;
    } finally {
      client.release();
    }
  }

  async getEmployeeById(employeeId) {
    const result = await pool.query(
      `
      SELECT
        e.employee_id   AS id,
        ep.first_name,
        ep.last_name,
        ep.gender,
        er.name         AS role,
        d.name          AS department,
        e.email,
        e.status,
        e.online_status,
        LEFT(ep.first_name, 1) AS initial
      FROM employees e
      JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
      LEFT JOIN employee_roles er ON ep.role_employee_id = er.role_employee_id
      LEFT JOIN departments   d  ON ep.department_id     = d.department_id
      WHERE e.employee_id = $1
    `,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  async updateEmployee(employeeId, body) {
    const id = parseInt(employeeId, 10);
    if (Number.isNaN(id)) {
      const err = new Error('รหัสพนักงานไม่ถูกต้อง');
      err.code = 'VALIDATION';
      throw err;
    }
    const ev = await pool.query(
      'SELECT employee_profile_id, email FROM employees WHERE employee_id = $1',
      [id]
    );
    if (ev.rowCount === 0) return null;
    const profileId = ev.rows[0].employee_profile_id;

    const first_name =
      body.first_name != null ? String(body.first_name).trim() : undefined;
    const last_name =
      body.last_name != null ? String(body.last_name).trim() : undefined;
    const gender = body.gender !== undefined ? (body.gender == null ? null : String(body.gender).trim()) : undefined;
    let roleId;
    if (body.role !== undefined) {
      roleId = await this.ensureRoleId(body.role);
    }
    let deptId;
    if (body.department !== undefined) {
      deptId = await this.ensureDepartmentId(body.department);
    }
    const email =
      body.email != null ? String(body.email).trim().toLowerCase() : undefined;
    const status = body.status != null ? String(body.status).trim() : undefined;
    const online_status =
      body.online_status != null ? String(body.online_status).trim() : undefined;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const profSets = [];
      const profVals = [];
      let i = 1;
      if (first_name !== undefined) {
        profSets.push(`first_name = $${i++}`);
        profVals.push(first_name);
      }
      if (last_name !== undefined) {
        profSets.push(`last_name = $${i++}`);
        profVals.push(last_name);
      }
      if (gender !== undefined) {
        profSets.push(`gender = $${i++}`);
        profVals.push(gender);
      }
      if (roleId !== undefined) {
        profSets.push(`role_employee_id = $${i++}`);
        profVals.push(roleId);
      }
      if (deptId !== undefined) {
        profSets.push(`department_id = $${i++}`);
        profVals.push(deptId);
      }
      if (profSets.length) {
        profVals.push(profileId);
        await client.query(
          `UPDATE employee_profiles SET ${profSets.join(', ')} WHERE employee_profile_id = $${i}`,
          profVals
        );
      }

      const empSets = [];
      const empVals = [];
      let j = 1;
      if (email !== undefined) {
        empSets.push(`email = $${j++}`);
        empVals.push(email);
      }
      if (status !== undefined) {
        empSets.push(`status = $${j++}`);
        empVals.push(status);
      }
      if (online_status !== undefined) {
        empSets.push(`online_status = $${j++}`);
        empVals.push(online_status);
      }
      if (body.password != null && String(body.password).trim() !== '') {
        empSets.push(`password_hash = $${j++}`);
        empVals.push(bcrypt.hashSync(String(body.password), 10));
      }
      if (empSets.length) {
        empVals.push(id);
        await client.query(
          `UPDATE employees SET ${empSets.join(', ')} WHERE employee_id = $${j}`,
          empVals
        );
      }
      if (!profSets.length && !empSets.length) {
        await client.query('ROLLBACK');
        return this.getEmployeeById(id);
      }
      await client.query('COMMIT');
    } catch (e) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore */
      }
      if (e.code === '23505') {
        const err = new Error('อีเมลนี้มีในระบบแล้ว');
        err.code = 'DUPLICATE_EMAIL';
        throw err;
      }
      throw e;
    } finally {
      client.release();
    }
    return this.getEmployeeById(id);
  }

  async deleteEmployee(employeeId) {
    const id = parseInt(employeeId, 10);
    if (Number.isNaN(id)) {
      const err = new Error('รหัสพนักงานไม่ถูกต้อง');
      err.code = 'VALIDATION';
      throw err;
    }
    const ev = await pool.query(
      'SELECT employee_profile_id FROM employees WHERE employee_id = $1',
      [id]
    );
    if (ev.rowCount === 0) return false;
    const profileId = ev.rows[0].employee_profile_id;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM employees WHERE employee_id = $1', [id]);
      await client.query('DELETE FROM employee_profiles WHERE employee_profile_id = $1', [
        profileId,
      ]);
      await client.query('COMMIT');
      return true;
    } catch (e) {
      try {
        await client.query('ROLLBACK');
      } catch {
        /* ignore */
      }
      throw e;
    } finally {
      client.release();
    }
  }

  // ดึงรายชื่อพนักงานทั้งหมด
  async getEmployees() {
    const result = await pool.query(`
      SELECT
        e.employee_id   AS id,
        ep.first_name,
        ep.last_name,
        ep.gender,
        er.name         AS role,
        d.name          AS department,
        e.email,
        e.status,
        e.online_status,
        LEFT(ep.first_name, 1) AS initial
      FROM employees e
      JOIN employee_profiles ep ON e.employee_profile_id = ep.employee_profile_id
      LEFT JOIN employee_roles er ON ep.role_employee_id = er.role_employee_id
      LEFT JOIN departments   d  ON ep.department_id     = d.department_id
      ORDER BY e.employee_id
    `);
    return result.rows;
  }

  // Dashboard: สถิติ KPI + รายการโครงการ + งานเร่งด่วน
  async getDashboardData() {
    // --- Events (projects) ---
    const eventsResult = await pool.query(`
      SELECT
        e.event_id   AS id,
        e.title,
        COALESCE(se.name, 'ไม่ระบุ') AS status,
        COALESCE(TO_CHAR(e.event_start_date, 'DD/MM/YYYY'), 'ยังไม่ระบุ') AS deadline,
        (SELECT COUNT(*) FROM participant_profiles pp 
         JOIN mapping_event_teams met ON pp.team_id = met.team_id 
         WHERE met.event_id = e.event_id) AS current_participants,
        COALESCE(l.max_participant, 100) AS max_participants,
        e.prize_pool,
        e.budget
      FROM events e
      LEFT JOIN status_events se ON e.status_event_id = se.status_event_id
      LEFT JOIN logistics l ON e.logistics_id = l.logistics_id
      ORDER BY e.event_id ASC
    `);

    // --- Task stats per event ---
    const taskStatsResult = await pool.query(`
      SELECT
        t.event_id,
        COUNT(*)                                   AS total_tasks,
        COUNT(*) FILTER (WHERE TRIM(ts.slug) = 'completed') AS done_tasks,
        COUNT(*) FILTER (WHERE TRIM(ts.slug) = 'pending') AS pending_tasks
      FROM tasks t
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      GROUP BY t.event_id
    `);
    const taskMap = {};
    taskStatsResult.rows.forEach(r => {
      taskMap[r.event_id] = {
        total:   parseInt(r.total_tasks)   || 0,
        done:    parseInt(r.done_tasks)    || 0,
        pending: parseInt(r.pending_tasks) || 0,
      };
    });

    // --- Team count per event ---
    const teamsResult = await pool.query(`
      SELECT event_id, COUNT(*) AS team_count
      FROM mapping_event_teams
      GROUP BY event_id
    `);
    const teamMap = {};
    teamsResult.rows.forEach(r => { teamMap[r.event_id] = parseInt(r.team_count) || 0; });

    // --- Participant count per event (via teams) ---
    // We already have current_participants seeded directly in the events table
    // so we don't need to join mapping_event_teams anymore. 

    // Enrich projects
    const projects = eventsResult.rows.map(ev => {
      const ts = taskMap[ev.id] || { total: 0, done: 0, pending: 0 };
      const progress = ts.total > 0 ? Math.round((ts.done / ts.total) * 100) : 0;
      const statusColorMap = {
        'กำลังดำเนินการ': 'bg-emerald-100 text-emerald-700',
        'เปิดรับสมัคร':   'bg-blue-100 text-blue-700',
        'วางแผน':         'bg-purple-100 text-purple-700',
        'ดำเนินการสำเร็จ':'bg-gray-100 text-gray-600',
        'ยกเลิก':         'bg-red-100 text-red-700',
      };
      return {
        id:           ev.id,
        title:        ev.title,
        status:       ev.status,
        statusColor:  statusColorMap[ev.status] || 'bg-gray-100 text-gray-600',
        deadline:     ev.deadline,
        teams:        teamMap[ev.id] || Math.floor(ev.current_participants / 5), // Mock fallback team avg
        participants: ev.current_participants || 0,
        maxParticipants: ev.max_participants || 100,
        prizePool:    ev.prize_pool || 'ไม่มีเงินรางวัล',
        tasks:        ts.total,
        tasksDone:    ts.done,
        issues:       ts.pending,
        progress:     progress,
      };
    });

    // --- Urgent tasks (priority สูง, ยังไม่เสร็จ) ---
    const urgentResult = await pool.query(`
      SELECT
        t.task_id         AS id,
        t.task_name       AS name,
        COALESCE(ev.title, 'ไม่ระบุ') AS project,
        pl.name           AS priority,
        COALESCE(
          CASE
            WHEN t.due_date::date = CURRENT_DATE       THEN 'วันนี้'
            WHEN t.due_date::date = CURRENT_DATE + 1   THEN 'พรุ่งนี้'
            ELSE TO_CHAR(t.due_date, 'DD MMM')
          END, 'ไม่ระบุ'
        ) AS deadline
      FROM tasks t
      LEFT JOIN events        ev ON t.event_id    = ev.event_id
      LEFT JOIN task_statuses ts ON t.status_task_id = ts.status_task_id
      LEFT JOIN priority_levels pl ON t.priority_id = pl.priority_id
      WHERE TRIM(ts.slug) <> 'completed'
        AND TRIM(pl.slug)  = 'high'
      ORDER BY t.due_date NULLS LAST
      LIMIT 5
    `);

    // --- KPI stats ---
    const totalProjects   = projects.length;
    const activeProjects  = projects.filter(p =>
      ['กำลังดำเนินการ', 'เปิดรับสมัคร'].includes(p.status)
    ).length;
    const totalParticipants = projects.reduce((s, p) => s + p.participants, 0);
    const totalPendingTasks = projects.reduce((s, p) => s + p.issues, 0);

    return {
      stats: {
        totalProjects,
        activeProjects,
        totalParticipants,
        totalPendingTasks,
        totalIssues: totalPendingTasks,
      },
      projects,
      urgentTasks: urgentResult.rows,
    };
  }
}

module.exports = new EmployeeService();
