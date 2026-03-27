const feedbackService = require('./backend/services/feedbackService');

async function test() {
  try {
    console.log('--- Testing Feedbacks (All) ---');
    const allFeedbacks = await feedbackService.getFeedbacks({ academic_year: 'all', projectId: 'all' });
    console.log('Count:', allFeedbacks.length);
    console.log('Data:', JSON.stringify(allFeedbacks, null, 2));

    console.log('\n--- Testing Stats (All) ---');
    const allStats = await feedbackService.getFeedbackStats({ academic_year: 'all', projectId: 'all' });
    console.log('Stats:', JSON.stringify(allStats, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

test();
