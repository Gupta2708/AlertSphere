# AlertSphere Frontend

A modern React + Tailwind dashboard for the AlertSphere platform.

---

## 🚀 Features
- Admin dashboard: create/manage alerts, view analytics
- User dashboard: receive, snooze, and mark alerts as read/unread
- Analytics charts (Recharts)
- Minimal, clean UI

---

## 🧑‍💻 Requirements
- Node.js 18+

---

## ⚙️ Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) (default Vite port)

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧩 Project Structure
```
frontend/
  src/
    api/         # API utility functions
    components/  # Reusable UI components
    pages/       # Admin/User dashboard pages
    App.jsx      # Main app with routing
    index.js     # Entry point
    index.css    # Tailwind base
  tailwind.config.js
  package.json
```

---

## 🔗 Backend Connection
- The frontend expects the backend API at `http://localhost:8000` (see `src/api/api.js`).
- Make sure the backend is running for full functionality.

---

## 🛠️ Customization
- Update `api.js` for different backend URLs or endpoints.
- Extend components/pages as needed for your organization.

---

## 🐞 Troubleshooting
- If you see CORS errors, ensure the FastAPI backend allows requests from the frontend port (see FastAPI CORS middleware docs).
- If Tailwind styles are missing, check that `index.css` includes Tailwind base imports and that `tailwind.config.js` scans the correct files.

---

## 📬 Questions?
Open an issue or contact the maintainer.
