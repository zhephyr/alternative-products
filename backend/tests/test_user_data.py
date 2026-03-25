import pytest
from fastapi.testclient import TestClient
from main import app
from services.db import SessionDB
import uuid

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionDB()
    db.sessions.truncate()
    db.users.truncate()
    db.history.truncate()
    db.favorites.truncate()
    yield

@pytest.fixture
def auth_headers():
    # Register and login to get auth token
    client.post("/api/auth/register", json={"username": "testuser", "password": "password123"})
    response = client.post("/api/auth/login", data={"username": "testuser", "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_add_and_get_favorites(auth_headers):
    # Add a favorite product
    product_data = {"id": "p123", "title": "Cool Chair", "price": "$120"}
    res = client.post("/api/user/favorites/p123", json=product_data, headers=auth_headers)
    assert res.status_code == 200

    # Get favorites
    res2 = client.get("/api/user/favorites", headers=auth_headers)
    assert res2.status_code == 200
    favs = res2.json()
    assert len(favs) == 1
    assert favs[0]["product_id"] == "p123"
    assert favs[0]["product_details"]["title"] == "Cool Chair"

def test_remove_favorite(auth_headers):
    client.post("/api/user/favorites/p123", json={"title": "test"}, headers=auth_headers)
    
    # Remove
    res = client.delete("/api/user/favorites/p123", headers=auth_headers)
    assert res.status_code == 200
    
    # Verify removed
    res2 = client.get("/api/user/favorites", headers=auth_headers)
    assert len(res2.json()) == 0

def test_add_duplicate_favorite(auth_headers):
    client.post("/api/user/favorites/p123", json={"title": "test"}, headers=auth_headers)
    res = client.post("/api/user/favorites/p123", json={"title": "test"}, headers=auth_headers)
    assert res.status_code == 400
    assert "already favorited" in res.json()["detail"].lower()

def test_history_logging(auth_headers):
    # Manually add a history entry 
    # (Since the /api/search endpoint requires multipart form upload which is complex to mock here)
    history_data = {
        "image_url": "test.jpg",
        "results": [{"id": "r1", "title": "Result Chair"}]
    }
    res = client.post("/api/user/history", json=history_data, headers=auth_headers)
    assert res.status_code == 200

    # Retrieve history
    res2 = client.get("/api/user/history", headers=auth_headers)
    history = res2.json()
    assert len(history) == 1
    assert history[0]["image_url"] == "test.jpg"

def test_unauthenticated_access():
    res1 = client.get("/api/user/favorites")
    assert res1.status_code == 401
    res2 = client.get("/api/user/history")
    assert res2.status_code == 401
