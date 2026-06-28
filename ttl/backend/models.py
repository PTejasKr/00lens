from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Seller(db.Model):
    __tablename__ = 'seller'
    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=False)  # reference to auth user id
    gstin = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    person_name = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    contact_details = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "gstin": self.gstin,
            "address": self.address,
            "company_name": self.company_name,
            "person_name": self.person_name,
            "phone_number": self.phone_number,
            "contact_details": self.contact_details,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

class SuspiciousLog(db.Model):
    __tablename__ = 'suspicious_log'
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    action = Column(String(255), nullable=False)
    details = Column(JSON, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "action": self.action,
            "details": self.details,
        }

class BRD(db.Model):
    __tablename__ = 'brd'
    id = Column(Integer, primary_key=True)
    version = Column(String(50), nullable=False, unique=True)
    content = Column(db.Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "version": self.version,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
        }

class PRSummary(db.Model):
    __tablename__ = 'pr_summary'
    id = Column(Integer, primary_key=True)
    pr_number = Column(Integer, nullable=False)
    repository = Column(String(255), nullable=False)
    brd_version_used = Column(String(50), nullable=False)
    summary_content = Column(db.Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "pr_number": self.pr_number,
            "repository": self.repository,
            "brd_version_used": self.brd_version_used,
            "summary_content": self.summary_content,
            "created_at": self.created_at.isoformat(),
        }
