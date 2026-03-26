"""
serp_api.py — SerpAPI integration for both organic Google Search and
Google Shopping product lookups.

Functions:
  - search_google_organic(ai_data): uses engine=google to find candidate
    product page URLs based on AI-extracted image attributes.
  - search_google_shopping(query): uses engine=google_shopping to resolve
    a scraped brand+product name to full shopping product data.
"""

import os
from urllib.parse import urlparse

import httpx

SERP_API_KEY = os.getenv("SERP_API_KEY")
SERP_API_URL = "https://serpapi.com/search.json"

# Non-store domains that should never appear in candidate URL results.
_SKIP_ORGANIC_DOMAINS = frozenset({
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


async def fetch_candidate_urls(ai_data: dict) -> list[dict]:
    """
    Uses SerpAPI's organic Google Search engine to find candidate products.

    Builds a search query from the ``category``, ``color`` and ``keywords``
    attributes in *ai_data*. Returns a filtered list of product matches:
      [{"link": "...", "title": "...", "source": "..."}, ...]

    Excludes known social media and non-store domains.
    Returns [] on any error.
    """
    # Build a human-readable product search query from AI attributes.
    category = ai_data.get("category", "")
    color = ai_data.get("color", "")
    keywords = " ".join(ai_data.get("keywords", []))
    query = " ".join(filter(None, [color, category, keywords, "buy"])).strip()

    params = {
        "engine": "google",
        "q": query,
        "api_key": SERP_API_KEY,
        "hl": "en",
        "gl": "us",
        "num": 10,
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(SERP_API_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            organic_results = data.get("organic_results", [])
            matches: list[dict] = []

            for result in organic_results:
                link = result.get("link", "")
                title = result.get("title", "")
                source = result.get("source", "")
                if not link or not title:
                    continue

                # Skip known non-store domains.
                domain = urlparse(link).netloc.replace("www.", "").lower()
                if any(skip in domain for skip in _SKIP_ORGANIC_DOMAINS):
                    continue

                matches.append({
                    "link": link,
                    "title": title,
                    "source": source
                })
                if len(matches) >= 10:
                    break

            return matches

        except httpx.HTTPError:
            return []


async def search_google_shopping(query: str) -> dict | None:
    """
    Searches Google Shopping via SerpAPI and returns the best matching
    product data, or None if no results are found or a network error occurs.
    """
    params = {
        "engine": "google_shopping",
        "q": query,
        "api_key": SERP_API_KEY,
        "hl": "en",
        "gl": "us",
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(SERP_API_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            results = data.get("shopping_results", [])
            if not results:
                return None
            
            # Take the first (most relevant) result.
            top_result = results[0]
            price = top_result.get("extracted_price", 0.0)

            # Compute price range for frontend filtering.
            if price < 100:
                price_range = "under-100"
            elif price <= 500:
                price_range = "100-500"
            elif price <= 1000:
                price_range = "500-1000"
            else:
                price_range = "over-1000"

            return {
                "name": top_result.get("title", "Unknown"),
                "brand": top_result.get("source", "Unknown Store"),
                "price": price,
                "rating": top_result.get("rating", 0.0),
                "reviewCount": top_result.get("reviews", 0),
                "imageUrl": top_result.get("thumbnail", ""),
                "link": top_result.get("link", "#"),
                "category": "Search Result",
                "priceRange": price_range,
            }

        except httpx.HTTPError:
            # Handle rate-limits or timeouts according to instructions.
            return None
