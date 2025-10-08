# AlertSphere Backend

**AlertSphere** is an AI-ready organizational alert and reminder platform. This backend is built with FastAPI, SQLAlchemy, and APScheduler for in-app notifications, reminders, and analytics.

---

## 🚀 Features
- Admin-configurable alerts (org/team/user visibility)
- Recurring reminders every 2 hours (APScheduler)
- User snooze, read/unread, and notification history
- Analytics dashboard API
- Modular, extensible OOP design

---

## 🧑‍💻 Requirements
- Python 3.10+
- (Optional) Virtualenv recommended

---

## ⚙️ Setup & Installation

1. **Clone the repo**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Seed the database with demo data:**
   ```bash
   python seed_data.py
   ```
   This creates demo teams, users, and alerts for testing.

4. **Run the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000)

---

## ⏰ Reminders & Scheduler
- Reminders are sent every 2 hours automatically (APScheduler starts on app startup).
- To manually trigger reminders (for testing):
  - Call the endpoint: `POST /admin/trigger-reminders`

---

## 📊 Analytics
- System-wide analytics available at: `GET /admin/analytics`

---

## 🧩 API Overview

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /admin/alerts         | Create alert |
| GET    | /admin/alerts         | List alerts (filters: severity, status, audience) |
| PUT    | /admin/alerts/{id}    | Update alert |
| DELETE | /admin/alerts/{id}    | Archive alert |
| GET    | /admin/analytics      | Get analytics |
| POST   | /admin/trigger-reminders | Manually trigger reminders |

### User APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /user/alerts          | Fetch alerts for user |
| PUT    | /user/alerts/{id}/read| Mark as read/unread |
| PUT    | /user/alerts/{id}/snooze | Snooze for the day |
| GET    | /user/alerts/snoozed  | View snoozed alerts |

---

## 🧹 Note on __pycache__
- Python may generate `__pycache__` folders for bytecode caching. These are not needed in source control and can be safely deleted.

---

## 🛠️ Extensibility
- Ready for future channels (Email/SMS), RBAC, and escalation logic.

---

## 📬 Questions?
Open an issue or contact the maintainer.

