import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app

client = TestClient(app)

@patch("routers.stream.Request.is_disconnected", new_callable=AsyncMock)
def test_stream_endpoint_returns_sse(mock_is_disconnected):
    """Verify that the stream endpoint returns text/event-stream and a connection event."""
    # Force the generator's loop to exit immediately after the first event
    mock_is_disconnected.return_value = True
    
    session_id = "test-session-123"
    
    # client.get will read the entire response, which will finish normally because is_disconnected is True
    response = client.get(f"/api/stream/{session_id}")
    
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    assert "data: connected" in response.text
