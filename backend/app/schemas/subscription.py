from pydantic import BaseModel
from datetime import date
from typing import Optional


class SubscriptionBase(BaseModel):
    name: str
    provider: Optional[str] = None
    amount: Optional[float] = None
    currency: str = "INR"
    billing_cycle: str  # monthly, yearly
    next_payment_date: Optional[date] = None
    auto_detected: bool = False
    is_active: bool = True
    notes: Optional[str] = None


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    billing_cycle: Optional[str] = None
    next_payment_date: Optional[date] = None
    auto_detected: Optional[bool] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class SubscriptionOut(SubscriptionBase):
    id: int

    class Config:
        orm_mode = True

