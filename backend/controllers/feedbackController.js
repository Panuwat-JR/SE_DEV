const feedbackService = require('../services/feedbackService');

exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedbackService.getFeedbacks();
    res.json(feedbacks);
  } catch (err) {
    console.error('Feedback Controller Error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};
