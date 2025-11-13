import React from "react";
import { motion } from "framer-motion";
import EmptyState from "./EmptyState";
import { Sparkles } from "lucide-react";

const AlertList = ({ alerts, readIds, onMarkRead, onSnooze, isSnoozed }) => {
  const activeAlerts = alerts.filter(alert => !isSnoozed(alert));

  if (activeAlerts.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="All caught up!"
        description="No active alerts right now."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {activeAlerts.map(alert => {
        const isRead = readIds.has(alert.id);
        return (
          <motion.li
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`py-4 px-4 flex justify-between items-center rounded-xl mb-2 ${
              isRead 
                ? 'bg-gray-50 opacity-70 text-gray-600' 
                : 'bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow'
            }`}
          >
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2 mb-1">
                {alert.title}
                <span className={`text-[10px] px-2 py-[2px] rounded-full uppercase tracking-wide ${
                  isRead 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-1">{alert.message}</div>
              <div className="text-xs text-gray-400">
                Severity: {alert.severity} | Audience: {alert.visibility_type}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <motion.button 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all" 
                onClick={() => onMarkRead(alert.id, true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mark Read
              </motion.button>
              <motion.button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all" 
                onClick={() => onSnooze(alert.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Snooze
              </motion.button>
              <motion.button 
                className="bg-slate-400 hover:bg-slate-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all" 
                onClick={() => onMarkRead(alert.id, false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mark Unread
              </motion.button>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
};

export default AlertList;

