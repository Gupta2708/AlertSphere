import React from "react";
import { motion } from "framer-motion";
import EmptyState from "./EmptyState";
import { BellOff } from "lucide-react";

const SnoozedAlertsList = ({ snoozed, readIds }) => {
  if (snoozed.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title="No snoozed alerts"
        description="All your alerts are active or cleared."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {snoozed.map(alert => {
        const isRead = readIds.has(alert.id);
        return (
          <motion.li
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`py-3 px-4 rounded-xl mb-2 ${
              isRead 
                ? 'bg-gray-50 opacity-70 text-gray-600' 
                : 'bg-white shadow-sm hover:shadow-md transition-shadow'
            }`}
          >
            <div className="font-medium">{alert.title}</div>
            {alert.message && (
              <div className="text-sm text-gray-500 mt-1">{alert.message}</div>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
};

export default SnoozedAlertsList;

