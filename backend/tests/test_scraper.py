"""
Tests for services/scraper.py.

TDD RED → GREEN:
  - test_semaphore_concurrency_limit: existing, kept
  - test_scrape_real_product_page_with_schema_markup: NEW — tests real HTML parsing
  - test_scrape_filters_out_of_stock: NEW — real out-of-stock gate
  - test_scrape_handles_http_error: NEW — network error resilience
  - test_scrape_filters_social_media_domains: NEW — domain blocklist before any HTTP request
  - test_scrape_concurrent_filters_nones: NEW — None filtering in the concurrent wrapper
"""

import pytest
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

from services.scraper import scrape_products_concurrently, scrape_single_product


# ---------------------------------------------------------------------------
# HTML Fixtures
# ---------------------------------------------------------------------------

# A realistic product page with complete schema.org markup.
VALID_PRODUCT_HTML = """\
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

# Same page but the product is out of stock.
OUT_OF_STOCK_HTML = """\
<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@type": "Product",
    "name": "Sold Out Chair",
    "offers": {
      "@type": "Offer",
      "price": "299.00",
      "availability": "https://schema.org/OutOfStock"
    }
  }
  </script>
</head>
<body><h1>Sold Out Chair</h1></body>
</html>
"""


def _make_mock_client(
    status_code: int,
    html: str = "",
    content_type: str = "text/html; charset=utf-8",
) -> AsyncMock:
    """
    Build a mock httpx.AsyncClient context manager that returns a fixed HTTP response.
    Patch `services.scraper.httpx.AsyncClient` with `return_value` set to this object.
    """
    mock_response = MagicMock()
    mock_response.status_code = status_code
    mock_response.headers = {"content-type": content_type}
    mock_response.text = html

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(return_value=mock_response)
    return mock_client


# ---------------------------------------------------------------------------
# Existing concurrency test (kept)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_semaphore_concurrency_limit():
    """Verify that the scraper limits concurrent operations to exactly 5."""
    urls = [f"http://example.com/product/{i}" for i in range(10)]

    start_time = time.time()

    with patch("services.scraper.scrape_single_product", new_callable=AsyncMock) as mock_scrape:
        async def delayed_scrape(url):
            await asyncio.sleep(0.5)
            return {"url": url, "brand": "TestBrand", "price": "100", "title": "Test"}

        mock_scrape.side_effect = delayed_scrape
        results = await scrape_products_concurrently(urls)

    duration = time.time() - start_time

    assert len(results) == 10
    assert results[0]["brand"] == "TestBrand"
    # 10 items at concurrency-5 → 2 batches × 0.5s ≈ 1.0s
    assert duration >= 0.9
    assert duration < 1.5  # not running strictly sequentially (5s)


# ---------------------------------------------------------------------------
# New real-behaviour tests (RED until implementation is in place)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_scrape_real_product_page_with_schema_markup():
    """
    Verify that scrape_single_product extracts product data from a valid
    product page using og: meta tags and schema.org JSON-LD markup.
    """
    mock_client = _make_mock_client(200, VALID_PRODUCT_HTML)

    with patch("services.scraper.httpx.AsyncClient", return_value=mock_client):
        result = await scrape_single_product("https://nordicliving.com/chairs/velvet-accent")

    assert result is not None, "Expected a product dict, got None"
    assert result["title"] == "Velvet Accent Chair"
    assert result["brand"] == "Nordic Living"
    assert "849" in str(result["price"])
    assert result["url"] == "https://nordicliving.com/chairs/velvet-accent"


@pytest.mark.asyncio
async def test_scrape_filters_out_of_stock():
    """
    Verify that scrape_single_product returns None for pages where schema.org
    availability is OutOfStock.
    """
    mock_client = _make_mock_client(200, OUT_OF_STOCK_HTML)

    with patch("services.scraper.httpx.AsyncClient", return_value=mock_client):
        result = await scrape_single_product("https://somestore.com/product/chair")

    assert result is None, "Expected None for out-of-stock product"


@pytest.mark.asyncio
async def test_scrape_handles_http_error():
    """
    Verify that scrape_single_product returns None (does not raise) when
    the underlying httpx request raises a ConnectError.
    """
    import httpx

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)
    mock_client.get = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))

    with patch("services.scraper.httpx.AsyncClient", return_value=mock_client):
        result = await scrape_single_product("https://unreachable-store.com/product/chair")

    assert result is None, "Expected None on network error"


@pytest.mark.asyncio
async def test_scrape_filters_social_media_domains():
    """
    Verify that scrape_single_product returns None for known non-store domains
    without making any HTTP request.
    """
    # No http mock needed — should short-circuit before fetching
    for social_url in [
        "https://www.youtube.com/watch?v=abc123",
        "https://www.reddit.com/r/furniture/comments/abc/nice_chair",
        "https://pinterest.com/pin/123456789",
    ]:
        result = await scrape_single_product(social_url)
        assert result is None, f"Expected None for social domain URL: {social_url}"


@pytest.mark.asyncio
async def test_scrape_concurrent_filters_nones():
    """
    Verify that scrape_products_concurrently filters out None results returned
    by scrape_single_product for failed or invalid pages.
    """
    urls = [
        "https://good-store.com/product/1",
        "https://bad-store.com/product/2",   # will return None
        "https://good-store.com/product/3",
    ]

    async def mock_scrape(url: str):
        if "bad-store" in url:
            return None
        return {"url": url, "title": "Good Product", "brand": "Good Store", "price": "$100"}

    with patch("services.scraper.scrape_single_product", side_effect=mock_scrape):
        results = await scrape_products_concurrently(urls)

    # Only 2 of 3 are valid; None must be filtered from the final list
    assert len(results) == 2, f"Expected 2 results after None filtering, got {len(results)}"
    assert all(r["brand"] == "Good Store" for r in results)
