import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <nav className="bg-blue-700 text-white px-6 py-3 flex gap-4">
          <Link to="/admin" className="hover:underline">Admin</Link>
          <Link to="/user" className="hover:underline">User</Link>
        </nav>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

