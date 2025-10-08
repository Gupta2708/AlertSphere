from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Alert, User, UserAlertPreference, NotificationDelivery, AlertTeam, AlertUser, VisibilityTypeEnum
from app.schemas import AlertOut
from app.services.notification import NotificationService
from app.utils.db import SessionLocal
from datetime import datetime

router = APIRouter(prefix="/user", tags=["User"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# For MVP, user_id is passed as query param (future: auth)
@router.get("/alerts", response_model=List[AlertOut])
def get_user_alerts(user_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []
    team_id = user.team_id
    org_id = user.team.organization_id if user.team else None
    # Org-level alerts for user's org
    org_alerts = db.query(Alert).filter(
        Alert.is_active == True,
        Alert.archived == False,
        Alert.start_time <= now,
        Alert.expiry_time >= now,
        Alert.organization_id == org_id,
        Alert.visibility_type == VisibilityTypeEnum.org
    ).all()
    # Team-level alerts for user's team
    team_alert_ids = db.query(AlertTeam.alert_id).filter(AlertTeam.team_id == team_id).all()
    team_alert_ids = [a[0] for a in team_alert_ids]
    team_alerts = db.query(Alert).filter(
        Alert.is_active == True,
        Alert.archived == False,
        Alert.start_time <= now,
        Alert.expiry_time >= now,
        Alert.visibility_type == VisibilityTypeEnum.team,
        Alert.id.in_(team_alert_ids)
    ).all()
    # User-level alerts for user
    user_alert_ids = db.query(AlertUser.alert_id).filter(AlertUser.user_id == user_id).all()
    user_alert_ids = [a[0] for a in user_alert_ids]
    user_alerts = db.query(Alert).filter(
        Alert.is_active == True,
        Alert.archived == False,
        Alert.start_time <= now,
        Alert.expiry_time >= now,
        Alert.visibility_type == VisibilityTypeEnum.user,
        Alert.id.in_(user_alert_ids)
    ).all()
    # Merge and deduplicate
    all_alerts = {a.id: a for a in org_alerts + team_alerts + user_alerts}
    return list(all_alerts.values())

@router.put("/alerts/{id}/read")
def mark_alert_read(id: int, user_id: int, read: bool = True, db: Session = Depends(get_db)):
    pref = db.query(UserAlertPreference).filter_by(user_id=user_id, alert_id=id).first()
    if not pref:
        pref = UserAlertPreference(user_id=user_id, alert_id=id)
        db.add(pref)
    service = NotificationService(db)
    if read:
        service.mark_read(pref)
    else:
        service.mark_unread(pref)
    db.commit()
    return {"detail": f"Alert marked as {'read' if read else 'unread'}"}

@router.put("/alerts/{id}/snooze")
def snooze_alert(id: int, user_id: int, db: Session = Depends(get_db)):
    pref = db.query(UserAlertPreference).filter_by(user_id=user_id, alert_id=id).first()
    if not pref:
        pref = UserAlertPreference(user_id=user_id, alert_id=id)
        db.add(pref)
    service = NotificationService(db)
    service.snooze(pref)
    db.commit()
    return {"detail": "Alert snoozed for today"}

@router.get("/alerts/snoozed", response_model=List[AlertOut])
def snoozed_alerts(user_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    prefs = db.query(UserAlertPreference).filter(
        UserAlertPreference.user_id == user_id,
        UserAlertPreference.snoozed_until != None,
        UserAlertPreference.snoozed_until > now
    ).all()
    alert_ids = [p.alert_id for p in prefs]
    if not alert_ids:
        return []
    alerts = db.query(Alert).filter(Alert.id.in_(alert_ids)).all()
    return alerts
