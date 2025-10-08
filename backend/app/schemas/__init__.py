from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from app.models import SeverityEnum, DeliveryTypeEnum, VisibilityTypeEnum

class OrganizationBase(BaseModel):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationOut(OrganizationBase):
    id: int
    class Config:
        orm_mode = True

class TeamBase(BaseModel):
    name: str
    organization_id: Optional[int]

class TeamCreate(TeamBase):
    pass

class TeamOut(TeamBase):
    id: int
    class Config:
        orm_mode = True

class AlertCreate(BaseModel):
    title: str
    message: str
    severity: SeverityEnum = SeverityEnum.info
    delivery_type: DeliveryTypeEnum = DeliveryTypeEnum.in_app
    reminder_frequency: int = 2
    start_time: datetime
    expiry_time: datetime
    visibility_type: VisibilityTypeEnum = VisibilityTypeEnum.org
    organization_id: Optional[int] = None
    team_id: Optional[int] = None
    user_id: Optional[int] = None

class AlertUpdate(BaseModel):
    title: Optional[str]
    message: Optional[str]
    severity: Optional[SeverityEnum]
    delivery_type: Optional[DeliveryTypeEnum]
    reminder_frequency: Optional[int]
    start_time: Optional[datetime]
    expiry_time: Optional[datetime]
    visibility_type: Optional[VisibilityTypeEnum]
    organization_id: Optional[int]
    team_id: Optional[int]
    user_id: Optional[int]
    is_active: Optional[bool]
    archived: Optional[bool]

class AlertOut(BaseModel):
    id: int
    title: str
    message: str
    severity: SeverityEnum
    delivery_type: DeliveryTypeEnum
    reminder_frequency: int
    start_time: datetime
    expiry_time: datetime
    visibility_type: VisibilityTypeEnum
    organization_id: Optional[int]
    team_id: Optional[int]
    user_id: Optional[int]
    is_active: bool
    archived: bool
    class Config:
        orm_mode = True

class AnalyticsOut(BaseModel):
    total_alerts: int
    delivered: int
    read: int
    snoozed_per_alert: Dict[int, int]
    severity_breakdown: Dict[str, int]

