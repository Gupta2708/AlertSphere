from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Alert, SeverityEnum, DeliveryTypeEnum, VisibilityTypeEnum, Organization, Team, User, AlertTeam, AlertUser
from app.schemas import AlertCreate, AlertUpdate, AlertOut, AnalyticsOut, OrganizationCreate, OrganizationOut, TeamCreate, TeamOut
from app.services.analytics import get_analytics
from app.services.scheduler import trigger_reminders
from app.utils.db import SessionLocal
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Organization CRUD ---
@router.post("/organizations", response_model=OrganizationOut)
def create_organization(org: OrganizationCreate, db: Session = Depends(get_db)):
    db_org = Organization(name=org.name)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

@router.get("/organizations", response_model=List[OrganizationOut])
def list_organizations(db: Session = Depends(get_db)):
    return db.query(Organization).all()

# --- Team CRUD ---
@router.post("/teams", response_model=TeamOut)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    db_team = Team(name=team.name, organization_id=team.organization_id)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/teams", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

# --- Alert Creation with Propagation ---
@router.post("/alerts", response_model=AlertOut)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    if alert.visibility_type == VisibilityTypeEnum.org:
        # Propagate to all teams and users under the org
        org = db.query(Organization).filter(Organization.id == alert.organization_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        db_alert = Alert(
            title=alert.title,
            message=alert.message,
            severity=alert.severity,
            delivery_type=alert.delivery_type,
            reminder_frequency=alert.reminder_frequency,
            start_time=alert.start_time,
            expiry_time=alert.expiry_time,
            visibility_type=alert.visibility_type,
            organization_id=org.id,
            is_active=True,
            archived=False
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        # Link to all teams and users under org using link tables
        teams = db.query(Team).filter(Team.organization_id == org.id).all()
        for team in teams:
            db_alert_team = AlertTeam(alert_id=db_alert.id, team_id=team.id)
            db.add(db_alert_team)
            users = db.query(User).filter(User.team_id == team.id).all()
            for user in users:
                db_alert_user = AlertUser(alert_id=db_alert.id, user_id=user.id)
                db.add(db_alert_user)
        db.commit()
        return db_alert
    elif alert.visibility_type == VisibilityTypeEnum.team:
        # Propagate to all users in the team
        team = db.query(Team).filter(Team.id == alert.team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        db_alert = Alert(
            title=f"{team.name}: {alert.title}",
            message=alert.message,
            severity=alert.severity,
            delivery_type=alert.delivery_type,
            reminder_frequency=alert.reminder_frequency,
            start_time=alert.start_time,
            expiry_time=alert.expiry_time,
            visibility_type=alert.visibility_type,
            organization_id=team.organization_id,
            team_id=team.id,
            is_active=True,
            archived=False
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        db_alert_team = AlertTeam(alert_id=db_alert.id, team_id=team.id)
        db.add(db_alert_team)
        users = db.query(User).filter(User.team_id == team.id).all()
        for user in users:
            db_alert_user = AlertUser(alert_id=db_alert.id, user_id=user.id)
            db.add(db_alert_user)
        db.commit()
        return db_alert
    elif alert.visibility_type == VisibilityTypeEnum.user:
        # Assign only to that user
        user = db.query(User).filter(User.id == alert.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        team = db.query(Team).filter(Team.id == user.team_id).first()
        db_alert = Alert(
            title=f"{team.name}/{user.name}: {alert.title}" if team else f"{user.name}: {alert.title}",
            message=alert.message,
            severity=alert.severity,
            delivery_type=alert.delivery_type,
            reminder_frequency=alert.reminder_frequency,
            start_time=alert.start_time,
            expiry_time=alert.expiry_time,
            visibility_type=alert.visibility_type,
            organization_id=team.organization_id if team else None,
            team_id=team.id if team else None,
            user_id=user.id,
            is_active=True,
            archived=False
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        db_alert_user = AlertUser(alert_id=db_alert.id, user_id=user.id)
        db.add(db_alert_user)
        if team:
            db_alert_team = AlertTeam(alert_id=db_alert.id, team_id=team.id)
            db.add(db_alert_team)
        db.commit()
        return db_alert
    else:
        raise HTTPException(status_code=400, detail="Invalid visibility type")

@router.get("/alerts", response_model=List[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    severity: Optional[SeverityEnum] = Query(None),
    active: Optional[bool] = Query(None),
    audience: Optional[VisibilityTypeEnum] = Query(None)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if active is not None:
        query = query.filter(Alert.is_active == active)
    if audience:
        query = query.filter(Alert.visibility_type == audience)
    return query.all()

@router.put("/alerts/{id}", response_model=AlertOut)
def update_alert(id: int, alert: AlertUpdate, db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    for field, value in alert.dict(exclude_unset=True).items():
        setattr(db_alert, field, value)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/alerts/{id}")
def archive_alert(id: int, db: Session = Depends(get_db)):
    db_alert = db.query(Alert).filter(Alert.id == id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db_alert.archived = True
    db_alert.is_active = False
    db.commit()
    return {"detail": "Alert archived"}

@router.get("/analytics", response_model=AnalyticsOut)
def analytics(db: Session = Depends(get_db)):
    return get_analytics(db)

@router.post("/trigger-reminders")
def trigger_reminders_endpoint():
    trigger_reminders()
    return {"detail": "Reminders triggered"}

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
