import pytest
from services.db import SessionDB

def test_create_and_get_session(tmp_path):
    """Verify that a session can be created and retrieved."""
    db_path = tmp_path / "test_db.json"
    db = SessionDB(str(db_path))
    
    session_id = "test-session-123"
    db.create_session(session_id)
    
    session = db.get_session(session_id)
    assert session is not None
    assert session["id"] == session_id
    assert session["status"] == "processing"
    assert session["results"] == []

def test_add_result_to_session(tmp_path):
    """Verify that a product result can be added to an existing session."""
    db_path = tmp_path / "test_db.json"
    db = SessionDB(str(db_path))
    
    session_id = "test-session-add"
    db.create_session(session_id)
    
    mock_product = {
        "title": "Beautiful Lamp",
        "price": "$50.00",
        "thumbnail": "http://example.com/lamp.jpg",
        "link": "http://example.com/lamp",
        "source": "Google Shopping"
    }
    
    db.add_result(session_id, mock_product)
    
    session = db.get_session(session_id)
    assert len(session["results"]) == 1
    assert session["results"][0]["title"] == "Beautiful Lamp"
