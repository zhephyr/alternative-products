"""
Tests for services/serp_api.py.

Covers:
  - search_google_shopping (existing)
  - search_google_organic (NEW) — RED until implementation is in place
"""

import pytest
from unittest.mock import AsyncMock, patch

from services.serp_api import search_google_shopping, search_google_organic


# ---------------------------------------------------------------------------
# Existing tests for search_google_shopping (kept unchanged)
# ---------------------------------------------------------------------------

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
                "source": "Mock Store",
            }
        ]
    }

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response

        result = await search_google_shopping("Mock Product Brand")

    assert result is not None
    assert result["name"] == "Mock Product Desk"
    assert result["price"] == 59.99
    assert result["link"] == "https://store.com/item"
    assert result["rating"] == 4.5
    assert result["reviewCount"] == 120
    assert result["brand"] == "Mock Store"
    assert result["category"] == "Search Result"
    assert result["priceRange"] == "under-100"


@pytest.mark.asyncio
async def test_search_google_shopping_no_results():
    """Verify that search_google_shopping handles empty or missing results gracefully."""
    mock_response = {"shopping_results": []}

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response

        result = await search_google_shopping("Obscure Item")

    assert result is None


# ---------------------------------------------------------------------------
# New tests for search_google_organic (RED until implementation is in place)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_search_google_organic_returns_product_urls():
    """
    Verify that search_google_organic builds a query from ai_data, calls
    SerpAPI's organic engine, and returns a filtered list of candidate URLs.
    """
    mock_response = {
        "organic_results": [
            {"link": "https://nordicliving.com/chairs/velvet", "title": "Velvet Chair"},
            {"link": "https://modernhome.com/products/lamp", "title": "Floor Lamp"},
            {"link": "https://youtube.com/watch?v=abc", "title": "Chair Review"},  # filtered
            {"link": "https://artisanfurnishings.com/table", "title": "Oak Table"},
        ]
    }

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response

        ai_data = {
            "category": "accent chair",
            "color": "mustard yellow",
            "keywords": ["mid-century", "velvet"],
        }
        result = await search_google_organic(ai_data)

    assert isinstance(result, list)
    # YouTube link must be filtered out
    assert "https://youtube.com/watch?v=abc" not in result
    # Valid store URLs are included
    assert "https://nordicliving.com/chairs/velvet" in result
    assert "https://modernhome.com/products/lamp" in result
    assert "https://artisanfurnishings.com/table" in result
    assert len(result) == 3


@pytest.mark.asyncio
async def test_search_google_organic_empty_results():
    """Verify search_google_organic returns [] when SerpAPI returns no organic results."""
    mock_response = {"organic_results": []}

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response

        result = await search_google_organic({"category": "chair", "color": "", "keywords": []})

    assert result == []


@pytest.mark.asyncio
async def test_search_google_organic_handles_http_error():
    """Verify search_google_organic returns [] on HTTP/network errors (does not raise)."""
    import httpx

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.HTTPError("Service unavailable")

        result = await search_google_organic({"category": "chair", "color": "", "keywords": []})

    assert result == []


@pytest.mark.asyncio
async def test_search_google_organic_filters_all_social_domains():
    """
    Verify that all major non-store domains (YouTube, Reddit, Pinterest, Instagram,
    Facebook, Twitter, Wikipedia) are excluded from results.
    """
    mock_response = {
        "organic_results": [
            {"link": "https://youtube.com/watch?v=abc"},
            {"link": "https://reddit.com/r/furniture"},
            {"link": "https://pinterest.com/pin/123"},
            {"link": "https://instagram.com/p/abc"},
            {"link": "https://facebook.com/marketplace"},
            {"link": "https://twitter.com/status/123"},
            {"link": "https://wikipedia.org/wiki/Chair"},
            {"link": "https://validstore.com/product/chair"},  # ONLY this passes
        ]
    }

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value.status_code = 200
        mock_get.return_value.json = lambda: mock_response

        result = await search_google_organic({"category": "chair", "color": "", "keywords": []})

    assert len(result) == 1
    assert result[0] == "https://validstore.com/product/chair"
