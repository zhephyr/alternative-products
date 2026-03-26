"""
scraper.py — Real product page scraper using httpx + BeautifulSoup.

Architecture:
  - scrape_single_product(url): fetches the URL, validates the page is a live
    product listing with stock, and extracts title/brand/price via og: meta
    tags and schema.org JSON-LD.  Returns None for any invalid/out-of-stock
    page or network error.
  - scrape_products_concurrently(urls): fans out to scrape_single_product with
    a semaphore capped at MAX_CONCURRENT_SCRAPES=5 and filters None values.
"""

import asyncio
import json
import re
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup


# Maximum parallel HTTP connections to product sites.
MAX_CONCURRENT_SCRAPES = 5
scrape_semaphore = asyncio.Semaphore(MAX_CONCURRENT_SCRAPES)

# Non-store domains that will never yield product listings.
# Checked before making any HTTP request.
SKIP_DOMAINS = frozenset({
    "youtube.com",
    "reddit.com",
    "pinterest.com",
    "instagram.com",
    "facebook.com",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "wikipedia.org",
    "google.com",
    "bing.com",
})

# Realistic browser headers to reduce bot-detection false-positives.
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


async def scrape_single_product(url: str) -> dict | None:
    """
    Fetches a single product URL and extracts product information.

    Returns a dict with keys ``url``, ``title``, ``brand``, and ``price``
    when successful, or None when:
      - the URL belongs to a known non-store domain
      - the HTTP request fails or times out
      - the response is not text/html
      - the schema.org data indicates the product is out of stock
      - no title can be extracted from the page
    """
    # --- Domain guard (no HTTP request needed) ---
    domain = urlparse(url).netloc.replace("www.", "").lower()
    if any(skip in domain for skip in SKIP_DOMAINS):
        return None

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(url, headers=_HEADERS)

        # Only process successful HTML responses.
        if response.status_code != 200:
            return None
        if "text/html" not in response.headers.get("content-type", ""):
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        # Bail out before parsing if the product is sold out.
        if not _extract_in_stock(soup):
            return None

        title = _extract_title(soup)
        if not title:
            return None

        return {
            "url": url,
            "title": title,
            "brand": _extract_brand(soup, url),
            "price": _extract_price(soup),
        }

    except Exception:
        # Broad catch for network errors, parse failures, and all other
        # exceptions to keep background tasks alive.
        return None


async def scrape_products_concurrently(urls: list[str]) -> list[dict]:
    """
    Fans out scrape_single_product over *urls* with a semaphore cap of
    MAX_CONCURRENT_SCRAPES.  None results (invalid / out-of-stock pages)
    and any Exceptions are filtered from the returned list.
    """
    async def bound_scrape(url: str):
        async with scrape_semaphore:
            return await scrape_single_product(url)

    tasks = [bound_scrape(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out both None (bad pages) and Exception instances (unexpected errors).
    return [r for r in results if r is not None and not isinstance(r, Exception)]


# ---------------------------------------------------------------------------
# Private extraction helpers
# ---------------------------------------------------------------------------

def _extract_title(soup: BeautifulSoup) -> str | None:
    """Return the best available product title, or None if nothing usable found."""
    # 1. og:title (most reliable for product pages)
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        return og_title["content"].strip()

    # 2. schema.org JSON-LD Product.name
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("@type") == "Product":
                name = data.get("name")
                if name:
                    return str(name).strip()
        except (json.JSONDecodeError, AttributeError):
            pass

    # 3. First <h1>
    h1 = soup.find("h1")
    if h1:
        text = h1.get_text(strip=True)
        if text:
            return text

    # 4. <title> tag (trimmed to 100 chars to avoid long site-name suffixes)
    title_tag = soup.find("title")
    if title_tag:
        text = title_tag.get_text(strip=True)[:100]
        if text:
            return text

    return None


def _extract_brand(soup: BeautifulSoup, url: str) -> str:
    """Return the brand/store name, falling back to the domain if unavailable."""
    # 1. og:site_name
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        return og_site["content"].strip()

    # 2. schema.org Product.brand
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("@type") == "Product":
                brand = data.get("brand", {})
                if isinstance(brand, dict) and brand.get("name"):
                    return brand["name"].strip()
                if isinstance(brand, str) and brand:
                    return brand.strip()
        except (json.JSONDecodeError, AttributeError):
            pass

    # 3. Fallback: capitalise the domain name (e.g. "nordicliving")
    domain = urlparse(url).netloc.replace("www.", "").split(".")[0]
    return domain.capitalize()


def _extract_price(soup: BeautifulSoup) -> str:
    """Return a price string, or 'Unknown' if no price is found."""
    # 1. og:price:amount
    og_price = soup.find("meta", property="og:price:amount")
    if og_price and og_price.get("content"):
        return og_price["content"].strip()

    # 2. schema.org offers.price
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("@type") == "Product":
                offers = data.get("offers", {})
                if isinstance(offers, dict) and "price" in offers:
                    return str(offers["price"])
                if isinstance(offers, list) and offers and "price" in offers[0]:
                    return str(offers[0]["price"])
        except (json.JSONDecodeError, AttributeError):
            pass

    # 3. Heuristic: first USD price-like pattern in the page text
    match = re.search(r"\$[\d,]+(?:\.\d{2})?", soup.get_text())
    if match:
        return match.group(0)

    return "Unknown"


def _extract_in_stock(soup: BeautifulSoup) -> bool:
    """
    Return True if schema.org data confirms InStock (or no availability info).
    Return False explicitly only when OutOfStock or Discontinued is found.
    """
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            if isinstance(data, dict) and data.get("@type") == "Product":
                offers = data.get("offers", {})
                availability = ""
                if isinstance(offers, dict):
                    availability = offers.get("availability", "")
                elif isinstance(offers, list) and offers:
                    availability = offers[0].get("availability", "")

                if "OutOfStock" in availability or "Discontinued" in availability:
                    return False
                if availability:
                    # Any explicit positive availability → in stock
                    return True
        except (json.JSONDecodeError, AttributeError):
            pass

    # No availability data found — assume in stock (better to try then fail at SerpAPI)
    return True
