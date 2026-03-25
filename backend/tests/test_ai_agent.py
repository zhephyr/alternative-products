import json
import asyncio
from unittest.mock import AsyncMock, MagicMock
from services.ai_agent import analyze_image

def test_analyze_image_openai():
    """Verify that analyze_image parses OpenAI's JSON response correctly via dependency injection."""
    
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps({
        "category": "accent chair",
        "color": "mustard yellow",
        "materials": ["velvet", "wood"],
        "keywords": ["mid-century modern", "tufted"]
    })
    
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    
    mock_client = MagicMock()
    mock_create = AsyncMock(return_value=mock_response)
    mock_client.chat.completions.create = mock_create
    
    # Run async function using standard asyncio
    result = asyncio.run(analyze_image(b"fake_image_bytes", provider="openai", client=mock_client))
    
    assert result["category"] == "accent chair"
    assert result["color"] == "mustard yellow"
    assert "velvet" in result["materials"]
    assert "mid-century modern" in result["keywords"]

def test_analyze_image_fallback():
    """Verify fallback behavior if the AI fails or returns invalid JSON."""
    
    mock_choice = MagicMock()
    mock_choice.message.content = "I'm sorry, I cannot analyze this image."
    
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    
    mock_client = MagicMock()
    mock_create = AsyncMock(return_value=mock_response)
    mock_client.chat.completions.create = mock_create
    
    result = asyncio.run(analyze_image(b"fake_image_bytes", provider="openai", client=mock_client))
    
    assert "category" in result
    assert result["category"] == "unknown"


if __name__ == "__main__":
    test_analyze_image_openai()
    test_analyze_image_fallback()
    print("ALL AI AGENT TESTS PASSED YAY!")
