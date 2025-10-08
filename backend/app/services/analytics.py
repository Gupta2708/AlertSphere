from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Alert, NotificationDelivery, UserAlertPreference, VisibilityTypeEnum, AlertTeam, AlertUser, Team, User
from typing import Dict

def get_analytics(db: Session) -> Dict:
    total_alerts = db.query(func.count(Alert.id)).scalar()
    delivered = db.query(func.count(NotificationDelivery.id)).scalar()
    # Count read alerts from UserAlertPreference table (where UserDashboard marks as read)
    read = db.query(func.count(UserAlertPreference.id)).filter(UserAlertPreference.is_read == True).scalar()
    snoozed = db.query(UserAlertPreference.alert_id, func.count(UserAlertPreference.id)).filter(UserAlertPreference.snoozed_until != None).group_by(UserAlertPreference.alert_id).all()
    # Severity breakdown with team/user info in title
    alerts = db.query(Alert).all()
    severity_breakdown = {}
    for alert in alerts:
        title = alert.title
        if str(alert.visibility_type) == VisibilityTypeEnum.team.value:
            team_link = db.query(AlertTeam).filter(AlertTeam.alert_id == alert.id).first()
            if team_link:
                t = db.query(Team).filter(Team.id == team_link.team_id).first()
                if t:
                    title = f"{t.name}: {alert.title}"
        elif str(alert.visibility_type) == VisibilityTypeEnum.user.value:
            user_link = db.query(AlertUser).filter(AlertUser.alert_id == alert.id).first()
            if user_link:
                u = db.query(User).filter(User.id == user_link.user_id).first()
                t = db.query(Team).filter(Team.id == u.team_id).first() if u else None
                if u and t:
                    title = f"{t.name}/{u.name}: {alert.title}"
                elif u:
                    title = f"{u.name}: {alert.title}"
        severity_breakdown[title] = severity_breakdown.get(title, 0) + 1
    return {
        "total_alerts": total_alerts,
        "delivered": delivered,
        "read": read,
        "snoozed_per_alert": {aid: count for aid, count in snoozed},
        "severity_breakdown": severity_breakdown
    }

