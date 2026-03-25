import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from main import app
from services.db import SessionDB

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionDB()
    db.sessions.truncate()
    db.history.truncate()
    db.users.truncate()
    yield

@pytest.mark.asyncio
async def test_search_endpoint_returns_session_id():
    """Verify that the search endpoint accepts an image and returns a session ID."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {'image': ('test.jpg', b'fake image data', 'image/jpeg')}
        response = await ac.post("/api/search", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0

from unittest.mock import patch

@patch("services.pipeline.analyze_image")
@patch("services.pipeline.scrape_products_concurrently")
@patch("services.pipeline.search_google_shopping")
def test_search_endpoint_saves_history_for_authenticated_users(mock_shopping, mock_scrape, mock_analyze):
    # Setup mocks
    mock_analyze.return_value = {"category": "test", "keywords": ["test"]}
    mock_scrape.return_value = [{"title": "test url product"}]
    mock_shopping.return_value = {"title": "Res Chair", "price": "$12"}

    with TestClient(app=app) as client:
        # Register and login to get auth token
        client.post("/api/auth/register", json={"username": "testuser", "password": "password123"})
        auth_res = client.post("/api/auth/login", data={"username": "testuser", "password": "password123"})
        token = auth_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Upload an image as authenticated user
        files = {'image': ('test-history.jpg', b'fake image data', 'image/jpeg')}
        response = client.post("/api/search", files=files, headers=auth_headers)
        
        assert response.status_code == 200
        
        # BackgroundTasks run synchronously after the response when using TestClient
        db = SessionDB()
        user = db.get_user_by_username("testuser")
        assert user is not None
        
        history = db.get_user_history(user["id"])
        assert len(history) == 1
        assert history[0]["image_url"] == "test-history.jpg"
        assert history[0]["image_url"] == "test-history.jpg"
