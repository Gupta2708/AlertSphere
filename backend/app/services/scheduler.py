from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
from app.models import Alert, User, UserAlertPreference
from app.services.notification import NotificationService
from app.utils.db import SessionLocal

scheduler = BackgroundScheduler()

# --- Helper: Get target users for an alert ---
def get_target_users(db: Session, alert: Alert) -> list:
    if alert.visibility_type.name == "org":
        return db.query(User).all()
    elif alert.visibility_type.name == "team":
        team_ids = [at.team_id for at in alert.teams]
        return db.query(User).filter(User.team_id.in_(team_ids)).all()
    elif alert.visibility_type.name == "user":
        user_ids = [au.user_id for au in alert.users]
        return db.query(User).filter(User.id.in_(user_ids)).all()
    return []

# --- Reminder Job ---
def reminder_job():
    db = SessionLocal()
    now = datetime.utcnow()
    alerts = db.query(Alert).filter(
        Alert.is_active == True,
        Alert.archived == False,
        Alert.start_time <= now,
        Alert.expiry_time >= now
    ).all()
    for alert in alerts:
        users = get_target_users(db, alert)
        for user in users:
            # Check snooze
            pref = db.query(UserAlertPreference).filter_by(user_id=user.id, alert_id=alert.id).first()
            if pref and pref.snoozed_until and pref.snoozed_until > now:
                continue  # Snoozed for today
            # Deliver notification
            service = NotificationService(db)
            service.deliver_alert(user, alert)
    db.close()

# --- Schedule the job every 2 hours ---
scheduler.add_job(reminder_job, 'interval', hours=2, id='reminder_job', replace_existing=True)

# --- Start scheduler (to be called in app startup) ---
def start_scheduler():
    if not scheduler.running:
        scheduler.start()

# --- Manual trigger for API endpoint ---
def trigger_reminders():
    reminder_job()
