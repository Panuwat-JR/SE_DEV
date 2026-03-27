const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/', feedbackController.getFeedbacks);
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;
