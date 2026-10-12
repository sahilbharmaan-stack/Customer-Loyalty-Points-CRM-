def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_dashboard_shape(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert "recent_activity" in data

def test_create_and_search_customer(client):
    response = client.post("/api/customers", json={
        "name": "Test Customer", "email": "test.customer@example.com", "phone": "12345", "tier": "Bronze"
    })
    assert response.status_code == 201
    customer_id = response.json()["id"]
    assert client.get(f"/api/customers/{customer_id}").status_code == 200
    assert len(client.get("/api/customers?q=Test Customer").json()) == 1

def test_duplicate_email_rejected(client):
    payload = {"name": "Test Customer", "email": "dupe@example.com"}
    assert client.post("/api/customers", json=payload).status_code == 201
    assert client.post("/api/customers", json=payload).status_code == 409

def test_earn_and_redeem_points(client):
    customer = client.post("/api/customers", json={
        "name": "Points Customer", "email": "points@example.com"
    }).json()
    earned = client.post("/api/loyalty/transactions", json={
        "customer_id": customer["id"], "kind": "earn", "points": 250, "note": "Test earn"
    })
    assert earned.status_code == 201
    updated = client.get(f"/api/customers/{customer['id']}").json()
    assert updated["points_balance"] == 250
    redeemed = client.post("/api/loyalty/transactions", json={
        "customer_id": customer["id"], "kind": "redeem", "points": 50, "note": "Test redeem"
    })
    assert redeemed.status_code == 201
    assert client.get(f"/api/customers/{customer['id']}").json()["points_balance"] == 200

def test_redeem_more_than_balance_rejected(client):
    customer = client.post("/api/customers", json={
        "name": "Empty Wallet", "email": "empty@example.com"
    }).json()
    response = client.post("/api/loyalty/transactions", json={
        "customer_id": customer["id"], "kind": "redeem", "points": 1
    })
    assert response.status_code == 400
