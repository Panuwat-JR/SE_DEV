const express = require('express');
const router = express.Router();
const c = require('../controllers/documentListController');

router.get('/:id/download', c.downloadDocument);
router.get('/:id/preview', c.getDocumentPreview);
router.get('/', c.listDocuments);
router.put('/:id', c.updateDocument);
router.post('/', c.createDocument);
router.delete('/:id', c.deleteDocument);

module.exports = router;
