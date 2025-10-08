import React, { useState, useEffect } from 'react';
import {
  getUserAlerts,
  markAlertRead,
  snoozeAlert,
  getSnoozedAlerts,
  getTeams,
  getUsers
} from '../api/api';

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
    <div className="p-6 max-w-3xl mx-auto">
      {/* Team/User Switcher */}
      <div className="mb-4 flex gap-4 items-center">
        <label className="font-semibold">Team:</label>
        <select
          value={selectedTeam ? selectedTeam.id : ''}
          onChange={e => {
            const team = teamUserMap.find(t => t.id === Number(e.target.value));
            setSelectedTeam(team);
            if (team && team.users.length > 0) setSelectedUser(team.users[0]);
            else setSelectedUser(null);
          }}
          className="border p-1 rounded"
        >
          {teamUserMap.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <label className="font-semibold ml-4">User:</label>
        <select
          value={selectedUser ? selectedUser.id : ''}
          onChange={e => {
            const user = selectedTeam.users.find(u => u.id === Number(e.target.value));
            setSelectedUser(user);
          }}
          className="border p-1 rounded"
          disabled={!selectedTeam || !selectedTeam.users.length}
        >
          {selectedTeam && selectedTeam.users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      <h1 className="text-2xl font-bold mb-4">User Alerts ({selectedUser ? selectedUser.name : ''} - {selectedTeam ? selectedTeam.name : ''})</h1>
      {/* Active Alerts List */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Active Alerts</h2>
        {loading && <div className="text-gray-400">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <ul className="divide-y">
          {alerts.length === 0 && <li className="py-2 text-gray-400">No active alerts.</li>}
          {alerts.filter(alert => !isSnoozed(alert)).map(alert => {
            const isRead = readIds.has(alert.id);
            return (
              <li
                key={alert.id}
                className={`py-2 px-3 flex justify-between items-center rounded ${isRead ? 'bg-gray-100 opacity-70 text-gray-600' : 'bg-white border-l-4 border-blue-500 shadow-sm'}`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {alert.title}
                    <span className={`text-[10px] px-2 py-[2px] rounded-full uppercase tracking-wide ${isRead ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{alert.message}</div>
                  <div className="text-xs text-gray-400">Severity: {alert.severity} | Audience: {alert.visibility_type}</div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleRead(alert.id, true)}>Mark Read</button>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handleSnooze(alert.id)}>Snooze</button>
                  <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => handleRead(alert.id, false)}>Mark Unread</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Snoozed Alerts History */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Snoozed Alerts</h2>
        <ul className="divide-y">
          {snoozed.length === 0 && <li className="py-2 text-gray-400">No snoozed alerts.</li>}
          {snoozed.map(alert => {
            const isRead = readIds.has(alert.id);
            return (
              <li key={alert.id} className={`py-2 px-3 rounded ${isRead ? 'bg-gray-100 opacity-70 text-gray-600' : ''}`}>{alert.title}</li>
            );
          })}
        </ul>
      </div>
      {/* Auto-refresh info */}
      <div className="text-xs text-gray-400 text-center">Alerts auto-refresh every 10 seconds.</div>
    </div>
  );
};

export default UserDashboard;
