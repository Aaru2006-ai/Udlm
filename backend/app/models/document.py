from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    doc_type = Column(String, nullable=True)  # Aadhaar, PAN, Marksheet, etc.
    expiry_date = Column(Date, nullable=True)
    storage_path = Column(String, nullable=False)  # local path or S3 path
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="documents")

