const pool = require('../config/db');

class FeedbackService {
  async getFeedbacks(filters = {}) {
    const { event_id, academic_year } = filters;
    let query = `
      SELECT DISTINCT ON (f.feedback_id)
        f.feedback_id AS id,
        f.comment,
        f.rating,
        f.create_at AS date,
        pp.firstname || ' ' || pp.lastname AS user_name,
        COALESCE(e.title, 'ทั่วไป / ไม่ระบุโครงการ') AS project_name,
        e.academic_year
      FROM feedbacks f
      JOIN participants p ON f.participant_id = p.participant_id
      JOIN participant_profiles pp ON p.participant_profile_id = pp.participant_profile_id
      LEFT JOIN teams t ON pp.team_id = t.team_id
      LEFT JOIN mapping_event_teams met ON t.team_id = met.team_id
      LEFT JOIN events e ON met.event_id = e.event_id
      WHERE 1=1
    `;
    const params = [];

    if (event_id && event_id !== 'all') {
      params.push(event_id);
      query += ` AND e.event_id = $${params.length}`;
    }
    if (academic_year && academic_year !== 'all') {
      params.push(academic_year);
      query += ` AND (e.academic_year = $${params.length} OR e.academic_year IS NULL)`;
    }

    query += ` ORDER BY f.feedback_id, f.create_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getFeedbackStats(filters = {}) {
    const { event_id, academic_year } = filters;
    let baseQuery = `
      FROM (
        SELECT DISTINCT ON (f.feedback_id) f.*, e.event_id, e.academic_year, e.title
        FROM feedbacks f
        LEFT JOIN participants p ON f.participant_id = p.participant_id
        LEFT JOIN participant_profiles pp ON p.participant_profile_id = pp.participant_profile_id
        LEFT JOIN teams t ON pp.team_id = t.team_id
        LEFT JOIN mapping_event_teams met ON t.team_id = met.team_id
        LEFT JOIN events e ON met.event_id = e.event_id
      ) f
      WHERE 1=1
    `;
    const params = [];

    if (event_id && event_id !== 'all') {
      params.push(event_id);
      baseQuery += ` AND f.event_id = $${params.length}`;
    }
    if (academic_year && academic_year !== 'all') {
      params.push(academic_year);
      baseQuery += ` AND (f.academic_year = $${params.length} OR f.academic_year IS NULL)`;
    }

    const metricsQuery = `
      SELECT 
        COUNT(*) AS total_responses,
        ROUND(AVG(rating), 1) AS avg_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) AS positive_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) AS neutral_count,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) AS negative_count
      ${baseQuery}
    `;

    const projectBreakdownQuery = `
      SELECT 
        COALESCE(f.title, 'อื่นๆ') AS name,
        ROUND(AVG(rating), 1) AS score
      ${baseQuery}
      GROUP BY f.title
      ORDER BY score DESC
    `;

    const [metrics, projects] = await Promise.all([
      pool.query(metricsQuery, params),
      pool.query(projectBreakdownQuery, params)
    ]);

    return {
      summary: metrics.rows[0],
      projectBreakdown: projects.rows
    };
  }
}

module.exports = new FeedbackService();
