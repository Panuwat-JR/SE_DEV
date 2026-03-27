const pool = require('../config/db');

/** รายการเอกสารสำหรับหน้าผู้บริหาร — โยงโครงการผ่าน mapping_doc_tasks → tasks → events */
exports.listDocuments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (d.document_id)
        d.document_id AS id,
        d.name,
        COALESCE(ds.name, 'ไม่ระบุ') AS doc_status,
        TO_CHAR(d.created_at AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COALESCE(e.title, 'ไม่ระบุ') AS project,
        '—' AS author,
        COALESCE(d.file_type, 'เอกสาร') AS type,
        d.file_storage_path
      FROM documents d
      LEFT JOIN document_statuses ds ON ds.doc_status_id = d.doc_status_id
      LEFT JOIN mapping_doc_tasks mdt ON mdt.document_id = d.document_id
      LEFT JOIN tasks tk ON tk.task_id = mdt.task_id
      LEFT JOIN events e ON e.event_id = tk.event_id
      ORDER BY d.document_id, d.updated_at DESC NULLS LAST, e.event_id NULLS LAST
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('listDocuments:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

/**
 * สร้างเอกสารและผูกกับงานแรกของโครงการ (ชื่อโครงการ = title ของ events)
 */
exports.createDocument = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const projectTitle = String(req.body?.project || '').trim();
  const eventIdBody = req.body?.event_id;
  if (!name) return res.status(400).json({ error: 'ต้องระบุชื่อเอกสาร' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let eventId = null;
    const eidNum =
      eventIdBody === '' || eventIdBody == null ? NaN : parseInt(String(eventIdBody), 10);
    if (Number.isFinite(eidNum)) {
      const byId = await client.query(`SELECT event_id FROM events WHERE event_id = $1 LIMIT 1`, [
        eidNum,
      ]);
      if (byId.rowCount > 0) eventId = byId.rows[0].event_id;
    }
    if (eventId == null && projectTitle) {
      const ev = await client.query(
        `SELECT event_id FROM events WHERE TRIM(title) = TRIM($1) LIMIT 1`,
        [projectTitle]
      );
      if (ev.rowCount > 0) eventId = ev.rows[0].event_id;
    }
    if (eventId == null) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ต้องระบุโครงการ (เลือกจากรายการหรือชื่อให้ตรงกับระบบ)' });
    }

    let taskR = await client.query(
      `SELECT task_id FROM tasks WHERE event_id = $1 ORDER BY task_id ASC LIMIT 1`,
      [eventId]
    );
    let taskId;
    if (taskR.rowCount > 0) {
      taskId = taskR.rows[0].task_id;
    } else {
      const st = await client.query(
        `SELECT status_task_id FROM task_statuses ORDER BY status_task_id ASC LIMIT 1`
      );
      const pr = await client.query(
        `SELECT priority_id FROM priority_levels ORDER BY priority_id ASC LIMIT 1`
      );
      const ct = await client.query(
        `SELECT task_category_id FROM task_categories ORDER BY task_category_id ASC LIMIT 1`
      );
      if (st.rowCount === 0 || pr.rowCount === 0 || ct.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'ไม่สามารถสร้างงานอัตโนมัติได้ — ขาด task_statuses / priority_levels / task_categories ใน DB',
        });
      }
      const insT = await client.query(
        `INSERT INTO tasks (task_name, event_id, status_task_id, priority_id, task_category_id, due_date)
         VALUES ($1, $2, $3, $4, $5, NULL) RETURNING task_id`,
        [
          'งานประกอบเอกสาร (สร้างอัตโนมัติ)',
          eventId,
          st.rows[0].status_task_id,
          pr.rows[0].priority_id,
          ct.rows[0].task_category_id,
        ]
      );
      taskId = insT.rows[0].task_id;
    }

    const statusR = await client.query(
      `SELECT doc_status_id FROM document_statuses ORDER BY doc_status_id ASC LIMIT 1`
    );
    const docStatusId = statusR.rows[0]?.doc_status_id ?? null;

    const ins = await client.query(
      `
      INSERT INTO documents (doc_status_id, name, file_storage_path, file_type, file_size, generation_status)
      VALUES ($1, $2, NULL, NULL, NULL, 'registered')
      RETURNING document_id, name, created_at, doc_status_id
    `,
      [docStatusId, name]
    );
    const doc = ins.rows[0];

    await client.query(
      `INSERT INTO mapping_doc_tasks (task_id, document_id) VALUES ($1, $2)
       ON CONFLICT (task_id, document_id) DO NOTHING`,
      [taskId, doc.document_id]
    );

    const ds = await client.query(`SELECT name FROM document_statuses WHERE doc_status_id = $1`, [
      doc.doc_status_id,
    ]);
    const et = await client.query(`SELECT title FROM events WHERE event_id = $1`, [eventId]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'บันทึกสำเร็จ',
      data: {
        id: doc.document_id,
        name: doc.name,
        doc_status: ds.rows[0]?.name || 'ร่าง',
        date: new Date(doc.created_at).toLocaleDateString('th-TH'),
        project: et.rows[0]?.title || projectTitle,
        author: '—',
        type: 'เอกสาร',
      },
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    console.error('createDocument:', err.message);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
};

/** อัปเดตชื่อเอกสารและ/หรือสถานะ (ชื่อสถานะต้องตรง document_statuses.name) */
exports.updateDocument = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'รหัสเอกสารไม่ถูกต้อง' });

  const nameRaw = req.body?.name;
  const statusRaw = req.body?.doc_status;
  const name = nameRaw != null ? String(nameRaw).trim() : null;
  const docStatusName = statusRaw != null ? String(statusRaw).trim() : null;

  if (!name && !docStatusName) {
    return res.status(400).json({ error: 'ระบุ name หรือ doc_status อย่างน้อยหนึ่งอย่าง' });
  }

  try {
    const ev = await pool.query(`SELECT document_id FROM documents WHERE document_id = $1`, [id]);
    if (ev.rowCount === 0) return res.status(404).json({ error: 'ไม่พบเอกสาร' });

    let statusId = null;
    if (docStatusName) {
      const st = await pool.query(
        `SELECT doc_status_id FROM document_statuses WHERE TRIM(name) = TRIM($1) LIMIT 1`,
        [docStatusName]
      );
      if (st.rowCount === 0) {
        return res.status(400).json({ error: `ไม่พบสถานะเอกสาร "${docStatusName}" ในระบบ` });
      }
      statusId = st.rows[0].doc_status_id;
    }

    const sets = [];
    const vals = [];
    let i = 1;
    if (name) {
      sets.push(`name = $${i++}`);
      vals.push(name);
    }
    if (statusId != null) {
      sets.push(`doc_status_id = $${i++}`);
      vals.push(statusId);
    }
    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);

    await pool.query(`UPDATE documents SET ${sets.join(', ')} WHERE document_id = $${i}`, vals);

    const list = await pool.query(
      `
      SELECT DISTINCT ON (d.document_id)
        d.document_id AS id,
        d.name,
        COALESCE(ds.name, 'ไม่ระบุ') AS doc_status,
        TO_CHAR(d.created_at AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COALESCE(e.title, 'ไม่ระบุ') AS project,
        '—' AS author,
        COALESCE(d.file_type, 'เอกสาร') AS type
      FROM documents d
      LEFT JOIN document_statuses ds ON ds.doc_status_id = d.doc_status_id
      LEFT JOIN mapping_doc_tasks mdt ON mdt.document_id = d.document_id
      LEFT JOIN tasks tk ON tk.task_id = mdt.task_id
      LEFT JOIN events e ON e.event_id = tk.event_id
      WHERE d.document_id = $1
      ORDER BY d.document_id, d.updated_at DESC NULLS LAST, e.event_id NULLS LAST
    `,
      [id]
    );

    res.json(list.rows[0] || { id, ok: true });
  } catch (err) {
    console.error('updateDocument:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteDocument = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'รหัสเอกสารไม่ถูกต้อง' });
  try {
    const r = await pool.query(`DELETE FROM documents WHERE document_id = $1 RETURNING document_id`, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteDocument:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

/** ดาวน์โหลด: ถ้ามี file_storage_path เป็น URL ให้ redirect; เป็น local path ให้ส่งไฟล์จริง; ไม่มีให้ส่งไฟล์ข้อความสรุปจาก DB */
exports.downloadDocument = async (req, res) => {
  const path = require('path');
  const fs = require('fs');
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'รหัสเอกสารไม่ถูกต้อง' });
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (d.document_id)
        d.document_id,
        d.name,
        COALESCE(ds.name, 'ไม่ระบุ') AS doc_status,
        TO_CHAR(d.created_at AT TIME ZONE 'UTC', 'DD/MM/YYYY') AS date,
        COALESCE(e.title, 'ไม่ระบุ') AS project,
        d.file_storage_path
      FROM documents d
      LEFT JOIN document_statuses ds ON ds.doc_status_id = d.doc_status_id
      LEFT JOIN mapping_doc_tasks mdt ON mdt.document_id = d.document_id
      LEFT JOIN tasks tk ON tk.task_id = mdt.task_id
      LEFT JOIN events e ON e.event_id = tk.event_id
      WHERE d.document_id = $1
      ORDER BY d.document_id, d.updated_at DESC NULLS LAST, e.event_id NULLS LAST
    `,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'ไม่พบเอกสาร' });
    const row = result.rows[0];
    const pathRaw = row.file_storage_path != null ? String(row.file_storage_path).trim() : '';

    // HTTP/HTTPS URL — redirect
    if (pathRaw && /^https?:\/\//i.test(pathRaw)) {
      return res.redirect(302, pathRaw);
    }

    // Local file path (e.g. /uploads/filename.pdf or uploads/filename.pdf)
    if (pathRaw) {
      // Resolve against the backend root (one level up from controllers/)
      const uploadsDir = path.resolve(__dirname, '..', 'uploads');
      const fileName = path.basename(pathRaw);
      // Prevent path traversal: only allow files inside the uploads directory
      const absPath = path.join(uploadsDir, fileName);
      if (absPath.startsWith(uploadsDir) && fs.existsSync(absPath)) {
        return res.download(absPath, fileName);
      }
    }

    // No real file — send text summary
    const safeBase = String(row.name || `document_${id}`).replace(/[/\\?%*:|"<>]/g, '_');
    const lines = [
      'NU SEED — สรุปเอกสารจากระบบ',
      '',
      `ชื่อ: ${row.name}`,
      `โครงการ: ${row.project}`,
      `สถานะ: ${row.doc_status}`,
      `วันที่บันทึก: ${row.date}`,
      '',
      'หมายเหตุ: ยังไม่มีไฟล์แนบใน storage — ไฟล์นี้สร้างจากข้อมูลในฐานข้อมูลเท่านั้น',
    ];
    const buf = Buffer.from(lines.join('\n'), 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeBase}_summary.txt"`);
    res.setHeader('Content-Length', String(buf.length));
    return res.send(buf);
  } catch (err) {
    console.error('downloadDocument:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
