import React from "react";
import { motion } from "framer-motion";
import { Sparkles, BellOff } from "lucide-react";

const EmptyState = ({ icon: Icon = Sparkles, title, description, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`py-12 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="flex flex-col items-center gap-3"
      >
        <Icon className="w-12 h-12 text-blue-400" />
        <p className="text-slate-500 text-lg font-medium">{title}</p>
        {description && <p className="text-slate-400 text-sm">{description}</p>}
      </motion.div>
    </motion.div>
  );
};

export default EmptyState;

