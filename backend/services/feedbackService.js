const pool = require('../config/db');

class FeedbackService {
  async getFeedbacks() {
    const result = await pool.query(`
      SELECT 
        f.feedback_id AS id,
        f.comment,
        f.create_at AS date,
        pp.firstname || ' ' || pp.lastname AS user_name,
        COALESCE(e.title, 'ทั่วไป / ไม่ระบุโครงการ') AS project_name
      FROM feedbacks f
      JOIN participants p ON f.participant_id = p.participant_id
      JOIN participant_profiles pp ON p.participant_profile_id = pp.participant_profile_id
      LEFT JOIN teams t ON pp.team_id = t.team_id
      LEFT JOIN mapping_event_teams met ON t.team_id = met.team_id
      LEFT JOIN events e ON met.event_id = e.event_id
      ORDER BY f.create_at DESC
    `);
    return result.rows;
  }
}

module.exports = new FeedbackService();
