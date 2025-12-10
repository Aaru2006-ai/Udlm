from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_at: datetime
    repeat_cycle: Optional[str] = None
    category: Optional[str] = None
    completed: bool = False


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    repeat_cycle: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None


class ReminderOut(ReminderBase):
    id: int

    class Config:
        orm_mode = True

