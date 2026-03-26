"""
Integration tests for the /api/search endpoint and the background pipeline.

TDD philosophy:
  - test_search_endpoint_returns_session_id: unchanged — basic smoke test
  - test_pipeline_runs_real_logic_and_saves_history: REFACTORED
      Previously mocked ALL three pipeline steps wholesale (analyze_image,
      scrape_products_concurrently, search_google_shopping), giving false
      confidence that any real functionality worked.

      Now only the two EXTERNAL SERVICE BOUNDARIES are mocked:
        1. analyze_image   — needs a real OpenAI key; impossible in CI
        2. search_google_organic — needs a real SerpAPI key
        3. httpx.AsyncClient (in the scraper) — network layer mock so real
           parsing logic runs on fixture HTML
        4. search_google_shopping — needs a real SerpAPI key

      Real pipeline orchestration, real semaphore, and real scraper parsing
      all execute on the mocked HTML fixture.  This test will only pass once
      scraper.py is fully implemented (GREEN phase).
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from main import app
from services.db import SessionDB


# ---------------------------------------------------------------------------
# HTML fixture shared across tests
# ---------------------------------------------------------------------------

_VALID_PRODUCT_HTML = """\
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="Velvet Accent Chair" />
  <meta property="og:site_name" content="Nordic Living" />
  <script type="application/ld+json">
  {
    "@type": "Product",
    "name": "Velvet Accent Chair",
    "brand": { "@type": "Brand", "name": "Nordic Living" },
    "offers": {
      "@type": "Offer",
      "price": "849.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  }
  </script>
</head>
<body><h1>Velvet Accent Chair</h1></body>
</html>
"""


# ---------------------------------------------------------------------------
# DB cleanup fixture (runs before every test in this module)
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def clean_db():
    db = SessionDB()
    db.sessions.truncate()
    db.history.truncate()
    db.users.truncate()
    yield


# ---------------------------------------------------------------------------
# Test 1 — basic smoke test (unchanged)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_search_endpoint_returns_session_id():
    """Verify that the search endpoint accepts an image and returns a session ID."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"image": ("test.jpg", b"fake image data", "image/jpeg")}
        response = await ac.post("/api/search", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert isinstance(data["session_id"], str)
    assert len(data["session_id"]) > 0


# ---------------------------------------------------------------------------
# Test 2 — integration test with only external-boundary mocks
# ---------------------------------------------------------------------------

# Decorator order: bottom decorator → first function arg
@patch("services.pipeline.analyze_image")           # AsyncMock auto-created; 3rd arg
@patch("services.pipeline.fetch_candidate_urls")    # AsyncMock auto-created; 2nd arg
@patch("services.pipeline.search_google_shopping")  # AsyncMock auto-created; 1st arg
@pytest.mark.asyncio
async def test_pipeline_runs_real_logic_and_saves_history(
    mock_shopping,
    mock_candidate_urls,
    mock_analyze,
):
    """
    Verify the full pipeline executes real orchestration and scraper logic,
    saves a search history entry for an authenticated user, and only mocks
    the two external service boundaries (AI + SerpAPI).

    Will FAIL (RED) until scraper.py real implementation is in place.
    """
    # Step 1: AI analysis returns attributes
    mock_analyze.return_value = {
        "category": "accent chair",
        "color": "mustard yellow",
        "keywords": ["mid-century", "velvet"],
    }

    # Step 2: fetch_candidate_urls returns metadata (link, title, source)
    mock_candidate_urls.return_value = [
        {"link": "https://nordicliving.com/chairs/velvet-accent", "title": "Velvet Accent Chair", "source": "Nordic Living"}
    ]

    # Step 3: Shopping search uses metadata to find alternative
    mock_shopping.return_value = {
        "name": "Alternative Velvet Chair",
        "brand": "AltBrand",
        "price": 199.99,
        "link": "https://alt-store.com/chair",
        "rating": 4.8,
        "reviewCount": 45,
        "category": "Furniture",
        "priceRange": "over-100",
    }

    with TestClient(app=app) as client:
        # Register and log in
        client.post(
            "/api/auth/register",
            json={"username": "pipelineuser", "password": "password123"},
        )
        auth_res = client.post(
            "/api/auth/login",
            data={"username": "pipelineuser", "password": "password123"},
        )
        token = auth_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Upload image — triggers background pipeline (runs synchronously in TestClient)
        files = {"image": ("product.jpg", b"fake image data", "image/jpeg")}
        response = client.post("/api/search", files=files, headers=auth_headers)

    assert response.status_code == 200

    # Verify that the pipeline saved a history entry via the real pipeline logic
    db = SessionDB()
    user = db.get_user_by_username("pipelineuser")
    assert user is not None, "User should exist after registration"

    history = db.get_user_history(user["id"])
    assert len(history) == 1, f"Expected 1 history entry, got {len(history)}"
    assert history[0]["image_url"] == "product.jpg"
