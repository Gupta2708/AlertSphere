module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        primary: "#2563EB",
        secondary: "#FACC15",
        background: "#F8FAFC",
      },
    },
  },
  plugins: [],
};

