"""
Tests for services/serp_api.py.

Covers:
  - search_google_shopping (existing)
  - search_google_organic (NEW) — RED until implementation is in place
"""

import pytest
from unittest.mock import AsyncMock, patch

from services.serp_api import search_google_shopping, fetch_candidate_urls


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
# New tests for fetch_candidate_urls (RED until implementation is in place)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_fetch_candidate_urls_returns_metadata():
    """
    Verify that fetch_candidate_urls builds a query from ai_data, calls
    SerpAPI's organic engine, and returns a filtered list of candidate dicts
    containing link, title, and source.
    """
    mock_response = {
        "organic_results": [
            {
                "link": "https://nordicliving.com/chairs/velvet",
                "title": "Velvet Accent Chair",
                "source": "Nordic Living"
            },
            {
                "link": "https://modernhome.com/products/lamp",
                "title": "Floor Lamp",
                "source": "Modern Home"
            },
            {
                "link": "https://youtube.com/watch?v=abc",
                "title": "Chair Review",
                "source": "YouTube"
            },  # filtered
            {
                "link": "https://artisanfurnishings.com/table",
                "title": "Oak Table",
                "source": "Artisan Furnishings"
            },
        ]
    }

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_response
        mock_resp.raise_for_status.return_value = None
        mock_get.return_value = mock_resp

        ai_data = {
            "category": "accent chair",
            "color": "mustard yellow",
            "keywords": ["mid-century", "velvet"],
        }
        result = await fetch_candidate_urls(ai_data)

    assert isinstance(result, list)
    # YouTube link must be filtered out
    assert not any(item["link"] == "https://youtube.com/watch?v=abc" for item in result)
    
    # Valid store metadata is included
    assert any(item["link"] == "https://nordicliving.com/chairs/velvet" for item in result)
    assert any(item["title"] == "Velvet Accent Chair" for item in result)
    assert any(item["source"] == "Nordic Living" for item in result)
    
    # 3 items remained (Nordic Living, Modern Home, Artisan Furnishings)
    assert len(result) == 3


@pytest.mark.asyncio
async def test_fetch_candidate_urls_empty_results():
    """Verify fetch_candidate_urls returns [] when SerpAPI returns no organic results."""
    mock_response = {"organic_results": []}

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_response
        mock_resp.raise_for_status.return_value = None
        mock_get.return_value = mock_resp

        result = await fetch_candidate_urls({"category": "chair", "color": "", "keywords": []})

    assert result == []


@pytest.mark.asyncio
async def test_fetch_candidate_urls_handles_http_error():
    """Verify fetch_candidate_urls returns [] on HTTP/network errors (does not raise)."""
    import httpx

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = httpx.HTTPError("Service unavailable")

        result = await fetch_candidate_urls({"category": "chair", "color": "", "keywords": []})

    assert result == []


@pytest.mark.asyncio
async def test_fetch_candidate_urls_filters_all_social_domains():
    """
    Verify that all major non-store domains (YouTube, Reddit, Pinterest, Instagram,
    Facebook, Twitter, Wikipedia) are excluded from results.
    """
    mock_response = {
        "organic_results": [
            {"link": "https://youtube.com/watch?v=abc", "source": "YouTube", "title": "T1"},
            {"link": "https://reddit.com/r/furniture", "source": "Reddit", "title": "T2"},
            {"link": "https://pinterest.com/pin/123", "source": "Pinterest", "title": "T3"},
            {"link": "https://instagram.com/p/abc", "source": "Instagram", "title": "T4"},
            {"link": "https://facebook.com/marketplace", "source": "Facebook", "title": "T5"},
            {"link": "https://twitter.com/status/123", "source": "Twitter", "title": "T6"},
            {"link": "https://wikipedia.org/wiki/Chair", "source": "Wikipedia", "title": "T7"},
            {"link": "https://validstore.com/product/chair", "source": "Valid Store", "title": "T8"},
        ]
    }

    with patch("services.serp_api.httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        from unittest.mock import MagicMock
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_response
        mock_resp.raise_for_status.return_value = None
        mock_get.return_value = mock_resp

        result = await fetch_candidate_urls({"category": "chair", "color": "", "keywords": []})

    assert len(result) == 1
    assert result[0]["link"] == "https://validstore.com/product/chair"
    assert result[0]["source"] == "Valid Store"
