import React from "react";

const Card = ({ className = "", children, ...props }) => (
  <div
    className={
      `rounded-2xl shadow-lg bg-white/70 p-6 backdrop-blur-xl transition-all hover:shadow-2xl duration-300 ${className}`
    }
    {...props}
  >
    {children}
  </div>
);

export default Card;
