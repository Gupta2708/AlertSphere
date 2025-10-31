const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Admin APIs
export const createAlert = async (data) => fetch(`${BASE_URL}/admin/alerts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const getAlerts = async (params = '') => fetch(`${BASE_URL}/admin/alerts${params}`).then(r => r.json());
export const updateAlert = async (id, data) => fetch(`${BASE_URL}/admin/alerts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const archiveAlert = async (id) => fetch(`${BASE_URL}/admin/alerts/${id}`, { method: 'DELETE' }).then(r => r.json());
export const getAnalytics = async () => fetch(`${BASE_URL}/admin/analytics`).then(r => r.json());
export const triggerReminders = async () => fetch(`${BASE_URL}/admin/trigger-reminders`, { method: 'POST' }).then(r => r.json());
export const getOrganizations = async () => fetch(`${BASE_URL}/admin/organizations`).then(r => r.json());

// Team and User APIs
export const getTeams = async () => fetch(`${BASE_URL}/admin/teams`).then(r => r.json());
export const getUsers = async () => fetch(`${BASE_URL}/admin/users`).then(r => r.json());

// User APIs
export const getUserAlerts = async (userId) => fetch(`${BASE_URL}/user/alerts?user_id=${userId}`).then(r => r.json());
export const markAlertRead = async (id, userId, read=true) => fetch(`${BASE_URL}/user/alerts/${id}/read?user_id=${userId}&read=${read}`, { method: 'PUT' }).then(r => r.json());
export const snoozeAlert = async (id, userId) => fetch(`${BASE_URL}/user/alerts/${id}/snooze?user_id=${userId}`, { method: 'PUT' }).then(r => r.json());
export const getSnoozedAlerts = async (userId) => fetch(`${BASE_URL}/user/alerts/snoozed?user_id=${userId}`).then(r => r.json());

