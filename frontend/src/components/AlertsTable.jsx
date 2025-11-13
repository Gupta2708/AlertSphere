import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AlertsTable = ({ alerts, onArchive }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Title</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Severity</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Audience</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alerts.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8 text-gray-300" />
                  <p>No alerts found.</p>
                </motion.div>
              </td>
            </tr>
          )}
          {alerts.map((alert, index) => (
            <motion.tr 
              key={alert.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`hover:bg-slate-50 transition-colors ${alert.is_active ? '' : 'text-gray-400'}`}
            >
              <td className="px-4 py-3 font-medium">{alert.title}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                  alert.severity === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {alert.severity}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {alert.is_active ? 'Active' : 'Expired/Archived'}
                </span>
              </td>
              <td className="px-4 py-3">{alert.visibility_type}</td>
              <td className="px-4 py-3">
                {alert.is_active && (
                  <motion.button 
                    onClick={() => onArchive(alert.id)} 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Archive
                  </motion.button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;

