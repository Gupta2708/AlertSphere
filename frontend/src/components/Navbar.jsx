import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, UserCircle, Github } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Admin", href: "/admin", icon: Shield },
  { name: "User", href: "/user", icon: UserCircle },
];

const utilityLinks = [
  { name: "Docs", href: "https://github.com/your-org/alertsphere#readme", external: true },
  { name: "GitHub", href: "https://github.com/your-org/alertsphere", icon: Github, external: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 left-0 z-40 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-6 py-3 flex items-center justify-between w-full transition-all duration-300 ${scrolled ? "shadow-md" : "shadow"}`}>
      {/* Brand Area */}
      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-2xl shadow-sm text-blue-700 font-bold text-lg select-none hover:bg-white/90 transition-colors">
        <Shield className="w-6 h-6 text-blue-600"/>
        <span>AlertSphere</span>
      </Link>
      {/* Main Nav Links */}
      <ul className="flex gap-2 items-center">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = path === href || (href === "/admin" && path === "/");
          return (
            <li key={name} className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={href}
                  aria-label={`Go to ${name} dashboard`}
                  className={`flex items-center gap-1 px-4 py-1.5 rounded-xl text-gray-700 font-semibold hover:bg-blue-50 focus:outline-none transition-all relative ${isActive ? "text-[#2563EB]" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-1 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 23 }}
                    />
                  )}
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
      {/* Utilities & Profile */}
      <div className="flex items-center gap-4">
        {/* Utility Links */}
        {utilityLinks.map(({ name, href, icon: Icon, external }) => (
          <motion.a
            key={name}
            aria-label={name}
            href={href}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-gray-600 hover:bg-blue-50 font-medium transition-all focus:outline-none"
            target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}
            whileHover={{ scale: 1.1, color: "#2563eb" }}
            whileTap={{ scale: 0.95 }}
          >
            {Icon ? <Icon className="w-5 h-5" /> : null}
            <span className="hidden sm:inline">{name}</span>
          </motion.a>
        ))}
        {/* Avatar - replace with user initials or avatar logic as needed */}
        <motion.div 
          className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 ml-2 border-2 border-blue-300 select-none cursor-pointer" 
          title="User Profile"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          AG
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
