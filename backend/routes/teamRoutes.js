// ไฟล์: routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/', teamController.getTeamsData);
router.post('/', teamController.createTeam);
router.delete('/:id', teamController.deleteTeam);

module.exports = router;