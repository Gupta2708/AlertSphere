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
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AlertsTable from '../components/AlertsTable';
import FloatingActionButton from '../components/FloatingActionButton';
import { Listbox } from '@headlessui/react';
import { Shield, AlertCircle, Plus, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

  // For team/user selectors
  const selectedTeam = teams.find(t => t.id === Number(form.team_id)) || teams[0];
  const filteredUsers = users.filter(u => u.team_id === Number(form.team_id));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-gray-800"
      >
        Admin Dashboard
      </motion.h1>
      
      {/* Alert Creation Form */}
      <Card className="mb-6">
        <SectionHeader
          title="Create Alert"
          icon={PlusCircle}
        />
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleCreateAlert}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleFormChange} 
              placeholder="Enter alert title" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <input 
              name="message" 
              value={form.message} 
              onChange={handleFormChange} 
              placeholder="Enter alert message" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select 
              name="severity" 
              value={form.severity} 
              onChange={handleFormChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
            >
              {severityOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
            <select 
              name="delivery_type" 
              value={form.delivery_type} 
              onChange={handleFormChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
            >
              <option>In-App</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Frequency (hours)</label>
            <input 
              name="reminder_frequency" 
              type="number" 
              min="1" 
              value={form.reminder_frequency} 
              onChange={handleFormChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility Type</label>
            <select 
              name="visibility_type" 
              value={form.visibility_type} 
              onChange={handleVisibilityChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
            >
              {audienceOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          {/* Team selector */}
          {form.visibility_type === 'Team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <select 
                name="team_id" 
                value={form.team_id} 
                onChange={handleTeamChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
          {/* User selector */}
          {form.visibility_type === 'User' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select 
                  name="team_id" 
                  value={form.team_id} 
                  onChange={handleTeamChange} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select 
                  name="user_id" 
                  value={form.user_id} 
                  onChange={handleUserChange} 
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none disabled:opacity-50" 
                  disabled={!form.team_id}
                >
                  <option value="">Select User</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {form.visibility_type === 'Organization' && organizations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <select 
                name="organization_id" 
                value={form.organization_id || organizations[0]?.id || ''} 
                onChange={handleFormChange} 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none"
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input 
              name="start_time" 
              type="datetime-local" 
              value={form.start_time} 
              onChange={handleFormChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time</label>
            <input 
              name="expiry_time" 
              type="datetime-local" 
              value={form.expiry_time} 
              onChange={handleFormChange} 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md transition-all outline-none" 
              required 
            />
          </div>
          <motion.button 
            type="submit" 
            className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating...' : (
              <>
                <Plus className="h-5 w-5" />
                Create Alert
              </>
            )}
          </motion.button>
        </form>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</motion.div>}
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">{success}</motion.div>}
      </Card>
      {/* Alerts Table */}
      <Card className="mb-6">
        <SectionHeader
          title="Alerts"
          icon={AlertCircle}
        />
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            name="severity" 
            value={filters.severity} 
            onChange={handleFilterChange} 
            className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">All Severities</option>
            {severityOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <select 
            name="active" 
            value={filters.active} 
            onChange={handleFilterChange} 
            className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Expired/Archived</option>
          </select>
          <select 
            name="audience" 
            value={filters.audience} 
            onChange={handleFilterChange} 
            className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
          >
            <option value="">All Audiences</option>
            {audienceOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
          <motion.button 
            onClick={fetchAlerts} 
            className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Refresh
          </motion.button>
        </div>
        {/* Table */}
        <AlertsTable alerts={alerts} onArchive={handleArchive} />
      </Card>
      {/* Analytics Dashboard */}
      <AnalyticsPanel analytics={analytics} />
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })} 
      />
      
      {/* Manual Reminders */}
      <div className="mt-4 flex justify-end">
        <motion.button 
          onClick={triggerReminders} 
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Trigger Reminders
        </motion.button>
      </div>
    </div>
  );
};

export default AdminDashboard;
