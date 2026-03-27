const express = require('express');
const router = express.Router();
const c = require('../controllers/participantAdminController');

router.get('/', c.listParticipants);
router.post('/', c.createParticipant);
router.delete('/:id', c.deleteParticipant);

module.exports = router;
