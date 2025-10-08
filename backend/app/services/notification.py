from abc import ABC, abstractmethod
from typing import List, Optional
from app.models import User, Alert, NotificationDelivery, UserAlertPreference
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# --- Strategy Pattern: Notification Channel ---
class NotificationChannel(ABC):
    @abstractmethod
    def send(self, db: Session, user: User, alert: Alert) -> None:
        pass

class InAppNotificationChannel(NotificationChannel):
    def send(self, db: Session, user: User, alert: Alert) -> None:
        # Create a NotificationDelivery record
        delivery = NotificationDelivery(
            alert_id=alert.id,
            user_id=user.id,
            delivered_at=datetime.utcnow(),
            read_status=False,
            reminder_count=1
        )
        db.add(delivery)
        db.commit()

# Future extension: EmailNotificationChannel, SMSNotificationChannel

# --- Observer Pattern: Alert Subscription ---
class AlertObserver(ABC):
    @abstractmethod
    def update(self, alert: Alert) -> None:
        pass

class UserAlertObserver(AlertObserver):
    def __init__(self, user: User):
        self.user = user
    def update(self, alert: Alert) -> None:
        # Placeholder for user-specific update logic
        pass

# --- State Pattern: Snooze/Read State ---
class AlertState(ABC):
    @abstractmethod
    def handle(self, db: Session, user_pref: UserAlertPreference) -> None:
        pass

class ReadState(AlertState):
    def handle(self, db: Session, user_pref: UserAlertPreference) -> None:
        user_pref.is_read = True
        db.commit()

class UnreadState(AlertState):
    def handle(self, db: Session, user_pref: UserAlertPreference) -> None:
        user_pref.is_read = False
        db.commit()

class SnoozedState(AlertState):
    def handle(self, db: Session, user_pref: UserAlertPreference) -> None:
        # Snooze until end of current day
        now = datetime.utcnow()
        snooze_until = datetime(now.year, now.month, now.day, 23, 59, 59)
        user_pref.snoozed_until = snooze_until
        db.commit()

# --- Notification Service ---
class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.channel = InAppNotificationChannel()  # MVP: only in-app

    def deliver_alert(self, user: User, alert: Alert) -> None:
        self.channel.send(self.db, user, alert)

    def mark_read(self, user_pref: UserAlertPreference) -> None:
        ReadState().handle(self.db, user_pref)

    def mark_unread(self, user_pref: UserAlertPreference) -> None:
        UnreadState().handle(self.db, user_pref)

    def snooze(self, user_pref: UserAlertPreference) -> None:
        SnoozedState().handle(self.db, user_pref)

