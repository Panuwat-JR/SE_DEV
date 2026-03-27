// ไฟล์: routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// เส้นทางสำหรับ /api/activities
router.get('/', activityController.getAllActivities);
router.post('/', activityController.createActivity);
// ต้องอยู่ก่อน /:id เพื่อไม่ให้ "events" ถูกจับเป็น id (เมื่อมี GET /:id)
router.get('/events', activityController.getEventsList);
router.get('/:id/applicants', activityController.getActivityApplicants);
router.post('/:id/remind-applicants', activityController.remindActivityApplicants);
router.delete('/:id', activityController.deleteActivity);
router.put('/:id', activityController.updateActivity);

module.exports = router;