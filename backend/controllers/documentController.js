const pool = require('../config/db');

exports.getDocuments = async (req, res) => {
  try {
    const query = `
      SELECT
        d.document_id AS id,
        d.name,
        COALESCE(ds.name, 'ร่าง') AS status,
        COALESCE(dt.slug, '') AS template,
        COALESCE(ev.title, 'ไม่ระบุโครงการ') AS project,
        TO_CHAR(d.created_at, 'DD/MM/YYYY') AS date,
        d.file_type,
        d.file_size,
        d.doc_metadata
      FROM documents d
      LEFT JOIN document_statuses ds ON d.doc_status_id = ds.doc_status_id
      LEFT JOIN mapping_template_docs mtd ON mtd.document_id = d.document_id
      LEFT JOIN document_templates dtp ON dtp.doc_template_id = mtd.doc_template_id
      LEFT JOIN document_types dt ON dt.document_type_id = dtp.document_type_id
      LEFT JOIN mapping_doc_tasks mdt ON mdt.document_id = d.document_id
      LEFT JOIN tasks t ON t.task_id = mdt.task_id
      LEFT JOIN events ev ON ev.event_id = t.event_id
      ORDER BY d.document_id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching documents:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.createDocument = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { name, doc_status_id, file_type, doc_metadata, doc_template_id } = req.body;

    // Insert the document
    const insertDoc = `
      INSERT INTO documents (name, doc_status_id, file_type, doc_metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING document_id
    `;
    const statusId = doc_status_id || null; // null if no statuses seeded yet
    const result = await client.query(insertDoc, [name, statusId, file_type || null, doc_metadata || null]);
    const newDocId = result.rows[0].document_id;

    // Link to template if provided
    if (doc_template_id) {
      await client.query(
        'INSERT INTO mapping_template_docs (document_id, doc_template_id) VALUES ($1, $2)',
        [newDocId, doc_template_id]
      );
    }

    await client.query('COMMIT');

    // Return the full document (re-query with JOINs)
    const fullQuery = `
      SELECT
        d.document_id AS id,
        d.name,
        COALESCE(ds.name, 'ร่าง') AS status,
        COALESCE(dt.slug, '') AS template,
        'ไม่ระบุโครงการ' AS project,
        TO_CHAR(d.created_at, 'DD/MM/YYYY') AS date,
        d.file_type,
        d.file_size,
        d.doc_metadata
      FROM documents d
      LEFT JOIN document_statuses ds ON d.doc_status_id = ds.doc_status_id
      LEFT JOIN mapping_template_docs mtd ON mtd.document_id = d.document_id
      LEFT JOIN document_templates dtp ON dtp.doc_template_id = mtd.doc_template_id
      LEFT JOIN document_types dt ON dt.document_type_id = dtp.document_type_id
      WHERE d.document_id = $1
    `;
    const fullResult = await client.query(fullQuery, [newDocId]);
    res.status(201).json(fullResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating document:', err.message);
    res.status(500).json({ error: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM documents WHERE document_id = $1 RETURNING document_id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted', id: Number(id) });
  } catch (err) {
    console.error('Error deleting document:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
