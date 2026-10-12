from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr


class CustomerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    tier: str = Field(default="Bronze", max_length=30)

class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    phone: str
    tier: str
    status: str
    points_balance: int
    lifetime_points: int
    created_at: datetime

class TransactionCreate(BaseModel):
    customer_id: int
    kind: str
    points: int = Field(gt=0, le=1_000_000)
    note: str = Field(default="", max_length=500)

class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_id: int
    kind: str
    points: int
    note: str
    created_at: datetime

class RewardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str
    points_cost: int
    category: str
    status: str
