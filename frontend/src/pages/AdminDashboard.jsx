import React, { useState, useEffect } from 'react';
import {
  createAlert,
  getAlerts,
  updateAlert,
  archiveAlert,
  getAnalytics,
  triggerReminders,
  getTeams,
  getUsers,
  getOrganizations
} from '../api/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const severityOptions = ["Info", "Warning", "Critical"];
const audienceOptions = ["Organization", "Team", "User"];

const AdminDashboard = () => {
  // Form state
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity: 'Info',
    delivery_type: 'In-App',
    reminder_frequency: 2,
    start_time: '',
    expiry_time: '',
    visibility_type: 'Organization',
    team_id: '',
    user_id: '',
    organization_id: ''
  });
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({ severity: '', active: '', audience: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch teams, users, and organizations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, usersData, orgsData] = await Promise.all([
          getTeams(),
          getUsers(),
          getOrganizations()
        ]);
        setTeams(teamsData);
        setUsers(usersData);
        setOrganizations(orgsData);
      } catch (e) {
        setError('Failed to load teams/users/orgs');
      }
    };
    fetchData();
  }, []);

  // Fetch alerts and analytics
  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    let params = [];
    if (filters.severity) params.push(`severity=${filters.severity}`);
    if (filters.active) params.push(`active=${filters.active}`);
    if (filters.audience) params.push(`audience=${filters.audience}`);
    const paramStr = params.length ? `?${params.join('&')}` : '';
    try {
      const data = await getAlerts(paramStr);
      setAlerts(data);
    } catch (e) {
      setError('Failed to fetch alerts');
    }
    setLoading(false);
  };
  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (e) {
      setAnalytics(null);
    }
  };
  useEffect(() => {
    fetchAlerts();
    fetchAnalytics();
    // Auto-refresh analytics every 5 seconds to sync with UserDashboard changes
    const analyticsInterval = setInterval(() => {
      fetchAnalytics();
    }, 5000);
    return () => clearInterval(analyticsInterval);
  }, [filters]);

  // Handle form
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleVisibilityChange = e => {
    const value = e.target.value;
    setForm(f => ({ ...f, visibility_type: value, team_id: '', user_id: '', organization_id: '' }));
  };
  const handleTeamChange = e => {
    setForm(f => ({ ...f, team_id: e.target.value, user_id: '', organization_id: '' }));
  };
  const handleUserChange = e => {
    setForm(f => ({ ...f, user_id: e.target.value, organization_id: '' }));
  };
  const handleCreateAlert = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        severity: form.severity,
        delivery_type: form.delivery_type,
        reminder_frequency: Number(form.reminder_frequency),
        start_time: new Date(form.start_time).toISOString(),
        expiry_time: new Date(form.expiry_time).toISOString(),
        visibility_type: form.visibility_type
      };
      if (form.visibility_type === 'Team') {
        payload.team_id = form.team_id ? Number(form.team_id) : null;
        delete payload.user_id;
        delete payload.organization_id;
      } else if (form.visibility_type === 'User') {
        payload.user_id = form.user_id ? Number(form.user_id) : null;
        payload.team_id = form.team_id ? Number(form.team_id) : null;
        delete payload.organization_id;
        if (!payload.user_id) {
          setError('Please select a user for user-level alert.');
          setLoading(false);
          return;
        }
      } else {
        payload.organization_id = form.organization_id ? Number(form.organization_id) : (organizations[0]?.id || null);
        delete payload.team_id;
        delete payload.user_id;
      }
      await createAlert(payload);
      setSuccess('Alert created!');
      setForm({
        title: '', message: '', severity: 'Info', delivery_type: 'In-App', reminder_frequency: 2,
        start_time: '', expiry_time: '', visibility_type: 'Organization', team_id: '', user_id: '', organization_id: organizations[0]?.id || ''
      });
      fetchAlerts();
    } catch (e) {
      setError('Failed to create alert');
    }
    setLoading(false);
  };

  // Handle archive
  const handleArchive = async id => {
    setLoading(true);
    setError('');
    try {
      await archiveAlert(id);
      fetchAlerts();
    } catch (e) {
      setError('Failed to archive alert');
    }
    setLoading(false);
  };

  // Handle filter change
  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Analytics chart colors
  const pieColors = ['#2563eb', '#f59e42', '#ef4444'];

  // For team/user selectors
  const selectedTeam = teams.find(t => t.id === Number(form.team_id)) || teams[0];
  const filteredUsers = users.filter(u => u.team_id === Number(form.team_id));

  // Pie chart team color mapping
  const teamColorMap = {
    Engineering: '#3B82F6',
    Marketing: '#F59E0B',
    Finance: '#EF4444',
  };
  const teamNames = Object.keys(teamColorMap);

  // Transform analytics.severity_breakdown to group by team
  const getTeamPieData = () => {
    if (!analytics || !analytics.severity_breakdown) return [];
    const teamCounts = { Engineering: 0, Marketing: 0, Finance: 0 };
    Object.entries(analytics.severity_breakdown).forEach(([title, count]) => {
      // Try to infer team from alert title prefix
      const lower = title.toLowerCase();
      if (lower.includes('engineering')) teamCounts.Engineering += count;
      else if (lower.includes('marketing')) teamCounts.Marketing += count;
      else if (lower.includes('finance')) teamCounts.Finance += count;
    });
    return teamNames.map(team => ({ name: team, value: teamCounts[team] }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {/* Alert Creation Form */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Create Alert</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateAlert}>
          <input name="title" value={form.title} onChange={handleFormChange} placeholder="Title" className="border p-2 rounded" required />
          <input name="message" value={form.message} onChange={handleFormChange} placeholder="Message" className="border p-2 rounded" required />
          <select name="severity" value={form.severity} onChange={handleFormChange} className="border p-2 rounded">
            {severityOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select name="delivery_type" value={form.delivery_type} onChange={handleFormChange} className="border p-2 rounded">
            <option>In-App</option>
          </select>
          <input name="reminder_frequency" type="number" min="1" value={form.reminder_frequency} onChange={handleFormChange} className="border p-2 rounded" />
          <select name="visibility_type" value={form.visibility_type} onChange={handleVisibilityChange} className="border p-2 rounded">
            {audienceOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          {/* Team selector */}
          {form.visibility_type === 'Team' && (
            <select name="team_id" value={form.team_id} onChange={handleTeamChange} className="border p-2 rounded">
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
          {/* User selector */}
          {form.visibility_type === 'User' && (
            <>
              <select name="team_id" value={form.team_id} onChange={handleTeamChange} className="border p-2 rounded">
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select name="user_id" value={form.user_id} onChange={handleUserChange} className="border p-2 rounded" disabled={!form.team_id}>
                <option value="">Select User</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </>
          )}
          {form.visibility_type === 'Organization' && organizations.length > 0 && (
            <select name="organization_id" value={form.organization_id || organizations[0]?.id || ''} onChange={handleFormChange} className="border p-2 rounded">
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
          <input name="start_time" type="datetime-local" value={form.start_time} onChange={handleFormChange} className="border p-2 rounded" required />
          <input name="expiry_time" type="datetime-local" value={form.expiry_time} onChange={handleFormChange} className="border p-2 rounded" required />
          <button type="submit" className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={loading}>Create Alert</button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
      </div>
      {/* Alerts Table */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Alerts</h2>
        {/* Filters */}
        <div className="flex gap-4 mb-2">
          <select name="severity" value={filters.severity} onChange={handleFilterChange} className="border p-1 rounded">
            <option value="">All Severities</option>
            {severityOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select name="active" value={filters.active} onChange={handleFilterChange} className="border p-1 rounded">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Expired/Archived</option>
          </select>
          <select name="audience" value={filters.audience} onChange={handleFilterChange} className="border p-1 rounded">
            <option value="">All Audiences</option>
            {audienceOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <button onClick={fetchAlerts} className="bg-gray-200 px-2 rounded">Refresh</button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Audience</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 && <tr><td colSpan={5} className="text-center py-4">No alerts found.</td></tr>}
              {alerts.map(alert => (
                <tr key={alert.id} className={alert.is_active ? '' : 'text-gray-400'}>
                  <td>{alert.title}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.is_active ? 'Active' : 'Expired/Archived'}</td>
                  <td>{alert.visibility_type}</td>
                  <td>
                    {alert.is_active && <button onClick={() => handleArchive(alert.id)} className="bg-red-500 text-white px-2 py-1 rounded">Archive</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Analytics Dashboard */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Analytics <button onClick={fetchAnalytics} className="bg-gray-200 px-2 rounded text-xs">Refresh</button></h2>
        {!analytics && <div className="h-32 flex items-center justify-center text-gray-400">Loading analytics...</div>}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2 font-semibold">Alerts by Severity</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getTeamPieData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ value, percent }) => value > 0 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''}
                    isAnimationActive={false}
                  >
                    {getTeamPieData().map((entry) => (
                      <Cell key={entry.name} fill={teamColorMap[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} alert${value !== 1 ? 's' : ''}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center text-xs">
                {teamNames.map(team => (
                  <span key={team} className="flex items-center gap-1">
                    <span style={{ background: teamColorMap[team], width: 12, height: 12, display: 'inline-block', borderRadius: 2 }}></span>
                    {team}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-semibold">Delivery Stats</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Total', value: analytics.total_alerts },
                  { name: 'Snoozed', value: Object.values(analytics.snoozed_per_alert || {}).reduce((a, b) => a + b, 0) },
                  { name: 'Read', value: analytics.read }
                ]}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Bar dataKey="value" fill="#2563eb" />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {/* Manual Reminders */}
      <div className="mt-4 flex justify-end">
        <button onClick={triggerReminders} className="bg-yellow-500 text-white px-4 py-2 rounded">Trigger Reminders</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
