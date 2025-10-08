# AlertSphere 🚨

A modern, AI-ready organizational alert and reminder platform built with FastAPI and React. AlertSphere enables organizations to create, manage, and track alerts across teams and users with real-time analytics and intuitive dashboards.

## ✨ Features

### 🎯 Alert Management
- **Multi-level Alerts**: Organization, Team, and User-specific alerts
- **Severity Levels**: Info, Warning, and Critical alerts
- **Smart Scheduling**: Configurable start/end times and reminder frequencies
- **Real-time Updates**: Auto-refresh every 10 seconds for live data

### 👥 User Experience
- **Intuitive Dashboards**: Separate admin and user interfaces
- **Visual Status Indicators**: Clear read/unread and snoozed states
- **Team Management**: Easy team and user selection
- **Action Controls**: Mark as read/unread, snooze alerts

### 📊 Analytics & Insights
- **Team-based Analytics**: Pie charts grouped by Engineering, Marketing, Finance
- **Delivery Statistics**: Track total, snoozed, and read alerts
- **Real-time Updates**: Analytics refresh automatically
- **Interactive Charts**: Built with Recharts for smooth visualization

### 🔧 Technical Features
- **RESTful API**: Clean, well-documented endpoints
- **Database Integration**: SQLAlchemy with SQLite (production-ready for PostgreSQL)
- **Background Scheduling**: APScheduler for automated reminders
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

## 🏗️ Architecture

```
AlertSphere/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Pydantic schemas
│   │   └── utils/          # Database utilities
│   ├── requirements.txt    # Python dependencies
│   └── seed_data.py        # Demo data seeding
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Dashboard components
│   │   ├── api/           # API client
│   │   └── components/    # Reusable UI components
│   ├── package.json       # Node.js dependencies
│   └── tailwind.config.js # Tailwind configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed demo data**
   ```bash
   python seed_data.py
   ```

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

## 📖 API Documentation

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/admin/alerts` | Create new alert |
| GET    | `/admin/alerts` | List all alerts (with filters) |
| PUT    | `/admin/alerts/{id}` | Update alert |
| DELETE | `/admin/alerts/{id}` | Archive alert |
| GET    | `/admin/analytics` | Get system analytics |
| POST   | `/admin/trigger-reminders` | Manually trigger reminders |

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/user/alerts` | Get user's alerts |
| PUT    | `/user/alerts/{id}/read` | Mark alert as read/unread |
| PUT    | `/user/alerts/{id}/snooze` | Snooze alert for the day |
| GET    | `/user/alerts/snoozed` | Get snoozed alerts |

### Data Models
- **Alert**: Core alert entity with title, message, severity, timing
- **User**: Team members with role-based access
- **Team**: Organizational units (Engineering, Marketing, Finance)
- **Organization**: Top-level entity
- **UserAlertPreference**: Tracks read/snooze status per user

## 🎨 User Interface

### Admin Dashboard
- **Alert Creation**: Form with team/user selection
- **Alert Management**: Table with filtering and archiving
- **Analytics**: Team-based pie charts and delivery statistics
- **Real-time Updates**: Auto-refresh for live data

### User Dashboard
- **Alert Viewing**: Clean list of active alerts
- **Status Management**: Mark as read/unread, snooze
- **Visual Indicators**: Color-coded read/unread states
- **Team Switching**: Easy navigation between teams

## 🔧 Configuration

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
DATABASE_URL=sqlite:///./alertsphere.db
SECRET_KEY=your-secret-key
DEBUG=True
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000
```

### Database
- **Development**: SQLite (included)
- **Production**: PostgreSQL (recommended)
- **Migrations**: Alembic (future enhancement)

## 🚀 Deployment

### Backend Deployment
1. **Production Server**: Use Gunicorn with Uvicorn workers
2. **Database**: Migrate to PostgreSQL
3. **Environment**: Set production environment variables
4. **Monitoring**: Add logging and health checks

### Frontend Deployment
1. **Build**: `npm run build`
2. **Hosting**: Deploy `dist/` folder to any static host
3. **CDN**: Use CloudFlare or similar for performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Roadmap

### Phase 1 (Current)
- ✅ Basic alert creation and management
- ✅ User and team dashboards
- ✅ Real-time analytics
- ✅ Read/unread status tracking

### Phase 2 (Planned)
- 🔄 Email and SMS notifications
- 🔄 Advanced scheduling (cron expressions)
- 🔄 Alert templates and categories
- 🔄 User authentication and authorization

### Phase 3 (Future)
- 🔄 Mobile app (React Native)
- 🔄 AI-powered alert prioritization
- 🔄 Integration with external tools (Slack, Teams)
- 🔄 Advanced reporting and insights

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (3.10+ required)
- Verify virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

**Frontend build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)
- Verify Tailwind CSS configuration

**Database issues**
- Run seed data: `python seed_data.py`
- Check database file permissions
- Verify SQLAlchemy models

**API connection errors**
- Ensure backend is running on port 8000
- Check CORS settings in FastAPI
- Verify API endpoints in browser dev tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend**: FastAPI, SQLAlchemy, APScheduler
- **Frontend**: React, Vite, Tailwind CSS, Recharts
- **Database**: SQLite (dev), PostgreSQL (prod ready)

## 📞 Support

For support, email support@alertsphere.com or create an issue in the GitHub repository.

---

**AlertSphere** - Making organizational communication more efficient, one alert at a time. 🚀
