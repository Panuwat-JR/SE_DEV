// ไฟล์: routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// เส้นทางสำหรับ /api/activities
router.post('/', activityController.createActivity);
router.delete('/:id', activityController.deleteActivity);

// เส้นทางสำหรับ /api/events (ดึงรายชื่อเข้า dropdown)
router.get('/events', activityController.getEventsList);

module.exports = router;