const express = require('express');
const router = express.Router();
const c = require('../controllers/documentListController');

router.get('/', c.listDocuments);
router.post('/', c.createDocument);

module.exports = router;
