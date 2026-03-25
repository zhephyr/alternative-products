import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from services.db import SessionDB

from routers.auth import limiter

@pytest.fixture(autouse=True)
def wipe_db():
    db = SessionDB()
    db.db.drop_tables()
    limiter._storage.reset()

@pytest.mark.asyncio
async def test_register_user_success():
    """Verify a user can register with a username and password."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/auth/register", json={
            "username": "testuser",
            "password": "strongPassword123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert "id" in data

@pytest.mark.asyncio
async def test_register_duplicate_user():
    """Verify duplicate usernames are rejected."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/auth/register", json={
            "username": "testuser",
            "password": "strongPassword123"
        })
        response = await ac.post("/api/auth/register", json={
            "username": "testuser",
            "password": "differentPassword"
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_success_returns_jwt():
    """Verify login issues access and refresh tokens."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/auth/register", json={
            "username": "testuser",
            "password": "strongPassword123"
        })
        
        response = await ac.post("/api/auth/login", data={
            "username": "testuser",
            "password": "strongPassword123"
        })
        assert response.status_code == 200
        tokens = response.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_rate_limit():
    """Verify slowapi rate-limits after 5 invalid attempts."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for _ in range(5):
            await ac.post("/api/auth/login", data={
                "username": "nobody",
                "password": "bad"
            })
            
        # 6th attempt should be rate limited (429)
        response = await ac.post("/api/auth/login", data={
            "username": "nobody",
            "password": "bad"
        })
        assert response.status_code == 429

@pytest.mark.asyncio
async def test_refresh_token():
    """Verify a valid refresh token yields a new access token."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/auth/register", json={"username": "testuser", "password": "pwd"})
        login_res = await ac.post("/api/auth/login", data={"username": "testuser", "password": "pwd"})
        tokens = login_res.json()
        
        refresh_res = await ac.post("/api/auth/refresh", json={
            "refresh_token": tokens["refresh_token"]
        })
        
        assert refresh_res.status_code == 200
        new_tokens = refresh_res.json()
        assert "access_token" in new_tokens

@pytest.mark.asyncio
async def test_get_current_user_me():
    """Verify protected /me route requires valid auth bearer."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/auth/register", json={"username": "testuser", "password": "pwd"})
        login_res = await ac.post("/api/auth/login", data={"username": "testuser", "password": "pwd"})
        access_token = login_res.json()["access_token"]
        
        # Test valid
        me_res = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"})
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "testuser"
        
        # Test invalid
        bad_me_res = await ac.get("/api/auth/me", headers={"Authorization": "Bearer BAD_TOKEN"})
        assert bad_me_res.status_code == 401
