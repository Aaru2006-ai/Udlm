from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_at = Column(DateTime, nullable=False)
    repeat_cycle = Column(String, nullable=True)  # monthly, yearly, none
    category = Column(String, nullable=True)  # rent, bill, warranty, etc
    completed = Column(Boolean, default=False)

    user = relationship("User", backref="reminders")

