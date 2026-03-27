const feedbackService = require('../services/feedbackService');

exports.getFeedbacks = async (req, res) => {
  try {
    const { event_id, academic_year } = req.query;
    const feedbacks = await feedbackService.getFeedbacks({ event_id, academic_year });
    res.json(feedbacks);
  } catch (err) {
    console.error('Feedback Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getFeedbackStats = async (req, res) => {
  try {
    const { event_id, academic_year } = req.query;
    const stats = await feedbackService.getFeedbackStats({ event_id, academic_year });
    res.json(stats);
  } catch (err) {
    console.error('Feedback Stats Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
