from app.models import Base, Organization, Team, User, Alert, SeverityEnum, DeliveryTypeEnum, VisibilityTypeEnum
from app.utils.db import engine, SessionLocal
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    # Clear existing data
    db.query(Alert).delete()
    db.query(User).delete()
    db.query(Team).delete()
    db.query(Organization).delete()
    db.commit()

    # Create organization
    org = Organization(name="Acme Corp")
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create teams
    eng = Team(name="Engineering", organization_id=org.id)
    mkt = Team(name="Marketing", organization_id=org.id)
    fin = Team(name="Finance", organization_id=org.id)
    db.add_all([eng, mkt, fin])
    db.commit()
    db.refresh(eng)
    db.refresh(mkt)
    db.refresh(fin)

    # Create users
    alice = User(name="Alice", team_id=eng.id)
    carol = User(name="Carol", team_id=mkt.id)
    eve = User(name="Eve", team_id=fin.id)
    db.add_all([alice, carol, eve])
    db.commit()
    db.refresh(alice)
    db.refresh(carol)
    db.refresh(eve)

    now = datetime.utcnow()
    # Org-level alert
    org_alert = Alert(
        title="Org-wide Alert",
        message="This is for all teams and users.",
        severity=SeverityEnum.info,
        delivery_type=DeliveryTypeEnum.in_app,
        reminder_frequency=2,
        start_time=now,
        expiry_time=now + timedelta(days=1),
        visibility_type=VisibilityTypeEnum.org,
        organization_id=org.id,
        is_active=True,
        archived=False
    )
    db.add(org_alert)
    # Team-level alert (Finance)
    fin_alert = Alert(
        title="Finance Only Alert",
        message="This is for Finance team only.",
        severity=SeverityEnum.warning,
        delivery_type=DeliveryTypeEnum.in_app,
        reminder_frequency=2,
        start_time=now,
        expiry_time=now + timedelta(days=1),
        visibility_type=VisibilityTypeEnum.team,
        organization_id=org.id,
        team_id=fin.id,
        is_active=True,
        archived=False
    )
    db.add(fin_alert)
    # User-level alert (Eve)
    eve_alert = Alert(
        title="Eve Only Alert",
        message="This is for Eve only.",
        severity=SeverityEnum.critical,
        delivery_type=DeliveryTypeEnum.in_app,
        reminder_frequency=2,
        start_time=now,
        expiry_time=now + timedelta(days=1),
        visibility_type=VisibilityTypeEnum.user,
        organization_id=org.id,
        team_id=fin.id,
        user_id=eve.id,
        is_active=True,
        archived=False
    )
    db.add(eve_alert)
    db.commit()
    print("Seeded organization, teams, users, and alerts.")

if __name__ == "__main__":
    seed()
