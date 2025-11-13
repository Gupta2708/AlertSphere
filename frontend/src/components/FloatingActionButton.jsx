import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const FloatingActionButton = ({ onClick, title = "Create New Alert" }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-400 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-30 hover:shadow-blue-500/50 transition-all"
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      aria-label={title}
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
};

export default FloatingActionButton;

