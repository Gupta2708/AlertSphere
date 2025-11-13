import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon, BarChart as BarChartIcon } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeader from "./SectionHeader";

const teamColorMap = {
  Engineering: "#3B82F6",
  Marketing: "#F59E0B",
  Finance: "#EF4444"
};
const teamNames = Object.keys(teamColorMap);

const AnalyticsPanel = ({ analytics }) => {
  const getTeamPieData = () => {
    if (!analytics || !analytics.severity_breakdown) return [];
    const teamCounts = { Engineering: 0, Marketing: 0, Finance: 0 };
    Object.entries(analytics.severity_breakdown).forEach(([title, count]) => {
      const lower = title.toLowerCase();
      if (lower.includes("engineering")) teamCounts.Engineering += count;
      else if (lower.includes("marketing")) teamCounts.Marketing += count;
      else if (lower.includes("finance")) teamCounts.Finance += count;
    });
    return teamNames.map(team => ({ name: team, value: teamCounts[team] }));
  };

  return (
    <div className="rounded-2xl shadow-xl bg-gradient-to-tr from-blue-50 to-white p-6 mb-6 relative overflow-hidden">
      {/* Floating Glow Effect */}
      <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-30 rounded-full -z-10"></div>
      
      <SectionHeader
        title="Analytics"
        icon={PieChartIcon}
      />
      {!analytics && (
        <div className="h-32 flex items-center justify-center text-gray-500">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading analytics...
          </motion.div>
        </div>
      )}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              <span>Alerts by Team</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getTeamPieData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ value, percent }) => value > 0 ? `${value} (${(percent * 100).toFixed(0)}%)` : ''}
                >
                  {getTeamPieData().map((entry) => (
                    <Cell key={entry.name} fill={teamColorMap[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} alert${value !== 1 ? 's' : ''}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 justify-center text-xs">
              {teamNames.map(team => {
                const data = getTeamPieData().find(t => t.name === team);
                const total = getTeamPieData().reduce((sum, t) => sum + t.value, 0);
                const percent = total > 0 ? ((data?.value || 0) / total * 100).toFixed(0) : 0;
                return (
                  <span key={team} className="flex items-center gap-1.5">
                    <span 
                      style={{ 
                        background: teamColorMap[team], 
                        width: 14, 
                        height: 14, 
                        display: 'inline-block', 
                        borderRadius: 3 
                      }}
                    ></span>
                    <span className="text-gray-700 font-medium">{team}</span>
                    <span className="text-gray-500">({percent}%)</span>
                  </span>
                );
              })}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <BarChartIcon className="w-5 h-5 text-blue-500" />
              <span>Delivery Statistics</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Total', value: analytics.total_alerts },
                { name: 'Snoozed', value: Object.values(analytics.snoozed_per_alert || {}).reduce((a, b) => a + b, 0) },
                { name: 'Read', value: analytics.read }
              ]}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
