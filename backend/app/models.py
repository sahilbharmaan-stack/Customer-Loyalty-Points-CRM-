from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(40), default="")
    tier = Column(String(30), default="Bronze", nullable=False)
    status = Column(String(20), default="Active", nullable=False)
    points_balance = Column(Integer, default=0, nullable=False)
    lifetime_points = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    transactions = relationship("LoyaltyTransaction", back_populates="customer", cascade="all, delete-orphan")

class LoyaltyTransaction(Base):
    __tablename__ = "loyalty_transactions"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    kind = Column(String(20), nullable=False)
    points = Column(Integer, nullable=False)
    note = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow, nullable=False)
    customer = relationship("Customer", back_populates="transactions")

class Reward(Base):
    __tablename__ = "rewards"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, default="")
    points_cost = Column(Integer, nullable=False)
    category = Column(String(50), default="General")
    status = Column(String(20), default="Active")
