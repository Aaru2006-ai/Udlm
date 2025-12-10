from sqlalchemy import Column, Integer, String, Date, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    provider = Column(String, nullable=True)  # Netflix, Spotify, etc
    amount = Column(Float, nullable=True)
    currency = Column(String, default="INR")
    billing_cycle = Column(String, nullable=False)  # monthly, yearly
    next_payment_date = Column(Date, nullable=True)
    auto_detected = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    notes = Column(String, nullable=True)

    user = relationship("User", backref="subscriptions")

