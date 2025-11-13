import React, { useState, useEffect } from 'react';
import {
  getUserAlerts,
  markAlertRead,
  snoozeAlert,
  getSnoozedAlerts,
  getTeams,
  getUsers
} from '../api/api';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import AlertList from '../components/AlertList';
import SnoozedAlertsList from '../components/SnoozedAlertsList';
import { Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamUserMap, setTeamUserMap] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [snoozed, setSnoozed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [readIds, setReadIds] = useState(new Set());

  // Fetch teams and users on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, usersData] = await Promise.all([getTeams(), getUsers()]);
        setTeams(teamsData);
        setUsers(usersData);
        // Build team-user map
        const map = teamsData.map(team => ({
          id: team.id,
          name: team.name,
          users: usersData.filter(u => u.team_id === team.id)
        }));
        setTeamUserMap(map);
        // Set default selection
        if (map.length > 0 && map[0].users.length > 0) {
          setSelectedTeam(map[0]);
          setSelectedUser(map[0].users[0]);
        }
      } catch (e) {
        setError('Failed to load teams/users');
      }
    };
    fetchData();
  }, []);

  const fetchAlerts = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError('');
    try {
      const data = await getUserAlerts(selectedUser.id);
      setAlerts(data);
    } catch (e) {
      setError('Failed to fetch alerts');
    }
    setLoading(false);
  };
  const fetchSnoozed = async () => {
    if (!selectedUser) return;
    try {
      const data = await getSnoozedAlerts(selectedUser.id);
      setSnoozed(data);
    } catch (e) {
      setSnoozed([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchSnoozed();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchSnoozed();
    }, 10000); // 10s
    return () => clearInterval(interval);
  }, [selectedUser]);

  const handleRead = async (id, read=true) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await markAlertRead(id, selectedUser.id, read);
      setSuccess(read ? 'Marked as read' : 'Marked as unread');
      setReadIds(prev => {
        const next = new Set(prev);
        if (read) next.add(id); else next.delete(id);
        return next;
      });
      await fetchAlerts();
      await fetchSnoozed();
    } catch (e) {
      setError('Failed to update alert');
    }
    setLoading(false);
  };
  const handleSnooze = async id => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await snoozeAlert(id, selectedUser.id);
      setSuccess('Alert snoozed for today');
      await fetchAlerts();
      await fetchSnoozed();
    } catch (e) {
      setError('Failed to snooze alert');
    }
    setLoading(false);
  };

  // Helper: check if alert is snoozed
  const isSnoozed = (alert) => snoozed.some(s => s.id === alert.id);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Gradient Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-b-2xl shadow-md mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">Your AlertSphere</h1>
        <p className="text-blue-50">Stay informed with real-time alerts tailored to your needs.</p>
      </motion.div>
      
      {/* Team/User Switcher */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white/70 backdrop-blur-xl rounded-xl p-4 shadow-md">
        <label className="font-semibold text-gray-700">Team:</label>
        <select
          value={selectedTeam ? selectedTeam.id : ''}
          onChange={e => {
            const team = teamUserMap.find(t => t.id === Number(e.target.value));
            setSelectedTeam(team);
            if (team && team.users.length > 0) setSelectedUser(team.users[0]);
            else setSelectedUser(null);
          }}
          className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
        >
          {teamUserMap.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <label className="font-semibold text-gray-700 ml-4">User:</label>
        <select
          value={selectedUser ? selectedUser.id : ''}
          onChange={e => {
            const user = selectedTeam.users.find(u => u.id === Number(e.target.value));
            setSelectedUser(user);
          }}
          className="border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all disabled:opacity-50"
          disabled={!selectedTeam || !selectedTeam.users.length}
        >
          {selectedTeam && selectedTeam.users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      {/* Active Alerts List */}
      <Card className="mb-6">
        <SectionHeader
          title="Active Alerts"
          icon={Bell}
        />
        {loading && <div className="text-gray-400 py-4">Loading...</div>}
        {error && <div className="text-red-600 py-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
        {success && <div className="text-green-600 py-4 p-3 bg-green-50 rounded-lg border border-green-200">{success}</div>}
        <AlertList 
          alerts={alerts}
          readIds={readIds}
          onMarkRead={handleRead}
          onSnooze={handleSnooze}
          isSnoozed={isSnoozed}
        />
      </Card>
      {/* Snoozed Alerts History */}
      <Card className="mb-6">
        <SectionHeader
          title="Snoozed Alerts"
          icon={BellOff}
        />
        <SnoozedAlertsList snoozed={snoozed} readIds={readIds} />
      </Card>
      {/* Auto-refresh info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6"
      >
        <div className="animate-pulse bg-blue-400 w-2 h-2 rounded-full"></div>
        <span>Alerts auto-refresh every 10 seconds</span>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
