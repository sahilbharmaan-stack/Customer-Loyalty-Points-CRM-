# LoyaltyOS — Customer Loyalty Points CRM

A premium React + FastAPI starter for managing customers, loyalty points, rewards, and activity.

## Features
- Responsive SaaS dashboard with sidebar navigation, KPI cards, charts, customer table, search and status filters.
- Customer directory with create-customer form.
- Loyalty ledger API: earn and redeem points with balance validation.
- Rewards catalog API.
- SQLite database for easy local setup; SQLAlchemy models.
- OpenAPI docs, health endpoint, CORS configuration.
- Automated backend API tests.

## Requirements
- Node.js 20+
- Python 3.11+

## Run backend (Windows PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API: http://127.0.0.1:8000  
Swagger docs: http://127.0.0.1:8000/docs

## Run backend (macOS/Linux)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

The frontend uses `VITE_API_URL` and defaults to `http://127.0.0.1:8000/api`.
Create `frontend/.env` if needed:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Deploy to Vercel

Import this GitHub repository into Vercel and use the repository root as the
project root. The root `pyproject.toml` configures Vercel to build the React
frontend and serve it alongside the FastAPI API. No `VITE_API_URL` setting is
needed for the combined deployment. Set the Vercel Framework Preset to
**FastAPI** so requests reach the API as well as the frontend.

The default SQLite database is stored under `/tmp` on Vercel. Vercel function
storage is temporary and instance-local, so customer or transaction changes
will not be durable or consistently shared between requests. Use a managed
database and set `DATABASE_URL` before using this deployment with real data.

## Test APIs
```bash
cd backend
pytest -q
```
Manual checks:
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/customers`
- `POST /api/customers`
- `POST /api/loyalty/transactions`
- `GET /api/rewards`

Example earn request:
```json
{"customer_id": 1, "kind": "earn", "points": 120, "note": "Welcome bonus"}
```
Example redeem request:
```json
{"customer_id": 1, "kind": "redeem", "points": 50, "note": "Coffee reward"}
```

## Important production checklist
This is a runnable MVP scaffold, not a production-hardened deployment. Before real customer data or public deployment, add authentication/authorization, migrations (Alembic), rate limiting, audit logs, email verification, backups, monitoring, secrets management, and privacy/legal review. Never expose the development database publicly.
