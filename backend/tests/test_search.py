import pytest
from httpx import AsyncClient, ASGITransport
from main import app

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
