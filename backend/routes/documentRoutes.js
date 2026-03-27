const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.get('/', documentController.getDocuments);
router.post('/', documentController.createDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
