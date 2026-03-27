const API_BASE = 'http://localhost:5000/api';

const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
};

export const fetchDashboardData = () => fetchWithErrorHandling('/dashboard-data');
export const fetchActivities = () => fetchWithErrorHandling('/activities');
export const createActivity = (data) => fetchWithErrorHandling('/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
export const fetchTasks = () => fetchWithErrorHandling('/tasks');
export const createTask = (data) => fetchWithErrorHandling('/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
export const fetchTeams = () => fetchWithErrorHandling('/teams');
export const createTeam = (data) => fetchWithErrorHandling('/teams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
export const fetchEmployees = () => fetchWithErrorHandling('/employees');
export const fetchDocuments = () => fetchWithErrorHandling('/documents');
export const createDocument = (data) => fetchWithErrorHandling('/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
export const deleteDocument = (id) => fetchWithErrorHandling(`/documents/${id}`, {
  method: 'DELETE',
});
// participantRoutes mapped to /api/participants-data in server.js
export const fetchParticipants = () => fetchWithErrorHandling('/participants-data');
export const fetchFaculties = () => fetchWithErrorHandling('/participants-data/faculties');
export const fetchMajors = () => fetchWithErrorHandling('/participants-data/majors');
export const createParticipant = (data) => fetchWithErrorHandling('/participants-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
