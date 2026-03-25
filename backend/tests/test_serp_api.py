import pytest
from unittest.mock import AsyncMock, patch
from services.serp_api import search_google_shopping

@pytest.mark.asyncio
async def test_search_google_shopping_success():
    """Verify that search_google_shopping extracts the first valid shopping result correctly."""
    mock_response = {
        "shopping_results": [
            {
                "title": "Mock Product Desk",
                "extracted_price": 59.99,
                "link": "https://store.com/item",
                "thumbnail": "https://img.com/thumb.jpg",
                "rating": 4.5,
                "reviews": 120,
                "source": "Mock Store"
            }
        ]
    }
    
    # Patch httpx.AsyncClient.get specifically
    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response
        
        # Test the function
        result = await search_google_shopping("Mock Product Brand")
        
        # Assertions
        assert result is not None
        assert result["title"] == "Mock Product Desk"
        assert result["price"] == 59.99
        assert result["link"] == "https://store.com/item"
        assert result["rating"] == 4.5
        assert result["reviewCount"] == 120
        assert result["source"] == "Mock Store"

@pytest.mark.asyncio
async def test_search_google_shopping_no_results():
    """Verify that search_google_shopping handles empty or missing results gracefully."""
    mock_response = {
        "shopping_results": []
    }
    
    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response
        
        result = await search_google_shopping("Obscure Item")
        assert result is None
