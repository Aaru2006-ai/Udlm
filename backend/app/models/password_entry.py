from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class PasswordEntry(Base):
    __tablename__ = "password_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service = Column(String, nullable=False)      # e.g. "Gmail"
    username = Column(String, nullable=False)
    encrypted_password = Column(String, nullable=False)  # stored encrypted
    strength_score = Column(Integer, nullable=True)      # 0–100
    breached = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="password_entries")

