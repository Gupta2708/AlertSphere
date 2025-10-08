from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base, Mapped, mapped_column
import enum
from datetime import datetime
from typing import Optional, List

Base = declarative_base()

class SeverityEnum(str, enum.Enum):
    """Severity levels for alerts."""
    info = "Info"
    warning = "Warning"
    critical = "Critical"

class DeliveryTypeEnum(str, enum.Enum):
    """Delivery channels for alerts."""
    in_app = "In-App"
    email = "Email"
    sms = "SMS"

class VisibilityTypeEnum(str, enum.Enum):
    """Visibility scope for alerts."""
    org = "Organization"
    team = "Team"
    user = "User"

class Organization(Base):
    """Represents an organization."""
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    teams: Mapped[List["Team"]] = relationship("Team", back_populates="organization")

class Team(Base):
    """Represents a team within the organization."""
    __tablename__ = "teams"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"))
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="teams")
    users: Mapped[List["User"]] = relationship("User", back_populates="team")

class User(Base):
    """Represents a user in the system."""
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    team_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("teams.id"))
    team: Mapped[Optional["Team"]] = relationship("Team", back_populates="users")
    preferences: Mapped[List["UserAlertPreference"]] = relationship("UserAlertPreference", back_populates="user")
    deliveries: Mapped[List["NotificationDelivery"]] = relationship("NotificationDelivery", back_populates="user")

class Alert(Base):
    """Represents an alert configured by an admin."""
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[SeverityEnum] = mapped_column(Enum(SeverityEnum), default=SeverityEnum.info)
    delivery_type: Mapped[DeliveryTypeEnum] = mapped_column(Enum(DeliveryTypeEnum), default=DeliveryTypeEnum.in_app)
    reminder_frequency: Mapped[int] = mapped_column(Integer, default=2)  # hours
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    expiry_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    visibility_type: Mapped[VisibilityTypeEnum] = mapped_column(Enum(VisibilityTypeEnum), default=VisibilityTypeEnum.org)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    archived: Mapped[bool] = mapped_column(Boolean, default=False)
    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("organizations.id"), nullable=True)
    team_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("teams.id"), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    deliveries: Mapped[List["NotificationDelivery"]] = relationship("NotificationDelivery", back_populates="alert")
    preferences: Mapped[List["UserAlertPreference"]] = relationship("UserAlertPreference", back_populates="alert")
    teams: Mapped[List["AlertTeam"]] = relationship("AlertTeam", back_populates="alert")
    users: Mapped[List["AlertUser"]] = relationship("AlertUser", back_populates="alert")

class AlertTeam(Base):
    """Link table for alert visibility to teams."""
    __tablename__ = "alert_teams"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_id: Mapped[int] = mapped_column(Integer, ForeignKey("alerts.id"))
    team_id: Mapped[int] = mapped_column(Integer, ForeignKey("teams.id"))
    alert: Mapped["Alert"] = relationship("Alert", back_populates="teams")
    team: Mapped["Team"] = relationship("Team")

class AlertUser(Base):
    """Link table for alert visibility to specific users."""
    __tablename__ = "alert_users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_id: Mapped[int] = mapped_column(Integer, ForeignKey("alerts.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    alert: Mapped["Alert"] = relationship("Alert", back_populates="users")
    user: Mapped["User"] = relationship("User")

class NotificationDelivery(Base):
    """Tracks each delivery of an alert to a user."""
    __tablename__ = "notification_deliveries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    alert_id: Mapped[int] = mapped_column(Integer, ForeignKey("alerts.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    delivered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    read_status: Mapped[bool] = mapped_column(Boolean, default=False)
    reminder_count: Mapped[int] = mapped_column(Integer, default=0)
    alert: Mapped["Alert"] = relationship("Alert", back_populates="deliveries")
    user: Mapped["User"] = relationship("User", back_populates="deliveries")

class UserAlertPreference(Base):
    """Tracks user-specific alert preferences (read/snooze)."""
    __tablename__ = "user_alert_preferences"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    alert_id: Mapped[int] = mapped_column(Integer, ForeignKey("alerts.id"))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    snoozed_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    user: Mapped["User"] = relationship("User", back_populates="preferences")
    alert: Mapped["Alert"] = relationship("Alert", back_populates="preferences")
