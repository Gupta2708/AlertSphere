import React from "react";
import { motion } from "framer-motion";

const SectionHeader = ({ icon: Icon, children, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 text-lg font-bold pb-1 relative"
    >
      {Icon && <Icon className="w-6 h-6 text-blue-500" />}
      <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent inline-block font-bold">
        {children}
      </span>
      {/* Animated Gradient Underline */}
      <motion.div
        layoutId="header-underline"
        className="absolute left-0 right-0 bottom-[-2px] h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-500 rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      />
    </motion.div>
  </div>
);

export default SectionHeader;
