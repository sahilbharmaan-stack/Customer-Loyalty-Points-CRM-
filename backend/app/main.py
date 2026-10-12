from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from .database import Base, engine, get_db
from . import models, schemas

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        if db.query(models.Customer).count() == 0:
            seed = [
                models.Customer(name="Aarav Mehta", email="aarav.mehta@example.com", phone="+91 98765 01001", tier="Platinum", points_balance=12480, lifetime_points=18900),
                models.Customer(name="Priya Sharma", email="priya.sharma@example.com", phone="+91 98765 01002", tier="Gold", points_balance=8250, lifetime_points=12100),
                models.Customer(name="Rohan Patel", email="rohan.patel@example.com", phone="+91 98765 01003", tier="Silver", points_balance=5420, lifetime_points=7800),
                models.Customer(name="Ananya Singh", email="ananya.singh@example.com", phone="+91 98765 01004", tier="Gold", points_balance=3900, lifetime_points=6400),
                models.Customer(name="Vikram Reddy", email="vikram.reddy@example.com", phone="+91 98765 01005", tier="Bronze", points_balance=1280, lifetime_points=2100),
                models.Customer(name="Neha Gupta", email="neha.gupta@example.com", phone="+91 98765 01006", tier="Silver", points_balance=6150, lifetime_points=9200),
            ]
            db.add_all(seed)
            db.flush()
            db.add_all([
                models.Reward(name="Free Signature Coffee", description="One signature drink on us.", points_cost=500, category="Food & Drink"),
                models.Reward(name="10% Off Next Order", description="Save on your next purchase.", points_cost=1000, category="Discount"),
                models.Reward(name="VIP Member Upgrade", description="Enjoy exclusive member perks.", points_cost=2500, category="Experience"),
                models.Reward(name="$25 Gift Card", description="A little something for your next visit.", points_cost=5000, category="Gift card"),
            ])
            db.commit()
    finally:
        db.close()
    yield

app = FastAPI(title="LoyaltyOS API", version="1.0.0", description="Customer loyalty and rewards management API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "LoyaltyOS API"}

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).count()
    points = db.query(func.sum(models.Customer.points_balance)).scalar() or 0
    transactions = db.query(models.LoyaltyTransaction).count()
    rewards = db.query(models.Reward).filter(models.Reward.status == "Active").count()
    recent = db.query(models.LoyaltyTransaction).order_by(desc(models.LoyaltyTransaction.created_at)).limit(6).all()
    activity = []
    for tx in recent:
        customer = db.query(models.Customer).filter(models.Customer.id == tx.customer_id).first()
        activity.append({
            "id": tx.id, "customer": customer.name if customer else "Unknown",
            "kind": tx.kind, "points": tx.points, "note": tx.note,
            "created_at": tx.created_at.isoformat()
        })
    return {"total_customers": customers, "points_in_circulation": points,
            "total_transactions": transactions, "active_rewards": rewards,
            "recent_activity": activity}

@app.get("/api/customers", response_model=list[schemas.CustomerOut])
def list_customers(q: str = Query(default="", max_length=120), tier: str = "", skip: int = 0,
                   limit: int = Query(default=100, ge=1, le=200), db: Session = Depends(get_db)):
    query = db.query(models.Customer)
    if q.strip():
        term = f"%{q.strip()}%"
        query = query.filter((models.Customer.name.ilike(term)) | (models.Customer.email.ilike(term)))
    if tier and tier.lower() != "all":
        query = query.filter(models.Customer.tier == tier)
    return query.order_by(models.Customer.id).offset(skip).limit(limit).all()

@app.post("/api/customers", response_model=schemas.CustomerOut, status_code=201)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    if db.query(models.Customer).filter(func.lower(models.Customer.email) == email).first():
        raise HTTPException(status_code=409, detail="A customer with this email already exists.")
    customer = models.Customer(name=payload.name.strip(), email=email, phone=payload.phone.strip(), tier=payload.tier)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer

@app.get("/api/customers/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer

@app.get("/api/loyalty/transactions", response_model=list[schemas.TransactionOut])
def list_transactions(customer_id: int | None = None, limit: int = Query(default=100, ge=1, le=500), db: Session = Depends(get_db)):
    query = db.query(models.LoyaltyTransaction)
    if customer_id is not None:
        query = query.filter(models.LoyaltyTransaction.customer_id == customer_id)
    return query.order_by(desc(models.LoyaltyTransaction.created_at)).limit(limit).all()

@app.post("/api/loyalty/transactions", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(payload: schemas.TransactionCreate, db: Session = Depends(get_db)):
    kind = payload.kind.lower().strip()
    if kind not in {"earn", "redeem", "adjust"}:
        raise HTTPException(status_code=422, detail="kind must be earn, redeem, or adjust.")
    customer = db.query(models.Customer).filter(models.Customer.id == payload.customer_id).with_for_update().first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    delta = payload.points if kind == "earn" else -payload.points
    if kind == "redeem" and customer.points_balance < payload.points:
        raise HTTPException(status_code=400, detail="Insufficient points balance.")
    if kind == "adjust":
        # Adjust transactions are treated as deductions; use earn to add points.
        if customer.points_balance < payload.points:
            raise HTTPException(status_code=400, detail="Adjustment exceeds current points balance.")
    customer.points_balance += delta
    if kind == "earn":
        customer.lifetime_points += payload.points
    tx = models.LoyaltyTransaction(customer_id=customer.id, kind=kind, points=payload.points, note=payload.note.strip())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@app.get("/api/rewards", response_model=list[schemas.RewardOut])
def list_rewards(db: Session = Depends(get_db)):
    return db.query(models.Reward).order_by(models.Reward.points_cost).all()

app.frontend("/", directory=str(Path(__file__).resolve().parents[2] / "dist"))
