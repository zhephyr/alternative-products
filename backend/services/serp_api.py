"""
serp_api.py — SerpAPI integration for both organic Google Search and
Google Shopping product lookups.

Functions:
  - fetch_candidate_urls(ai_data): uses engine=google_shopping to find candidate
    product page tokens and sources based on AI-extracted image attributes.
  - search_immersive_product(page_token, source): uses engine=google_immersive_product
    to resolve a page token to full enriched product data.
"""

import os
from urllib.parse import urlparse

import serpapi

SERP_API_KEY = os.getenv("SERP_API_KEY")

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


def fetch_candidate_urls(ai_data: dict) -> list[dict]:
    """
    Uses SerpAPI's Google Shopping engine to find candidate product tokens.

    Builds a search query from the ``category``, ``color`` and ``keywords``
    attributes in *ai_data*. Returns a filtered list of product matches:
      [{"immersive_product_page_token": "...", "source": "..."}, ...]

    Excludes known social media and non-store domains.
    Returns [] on any error.
    """
    # Build a human-readable product search query from AI attributes.
    category = ai_data.get("category", "")
    color = ai_data.get("color", "")
    materials = " ".join(ai_data.get("materials", []))
    keywords = " ".join(ai_data.get("keywords", []))
    query = " ".join(filter(None, [f'-"{category}"', color, materials, keywords])).strip()
    print(f"[ATOMIC_LOG] Candidate search query: {query}")

    try:
        client = serpapi.Client(api_key=SERP_API_KEY)
        data = client.search(
            engine="google_shopping",
            q=query,
            hl="en",
            gl="us"
        )

        results = data.get("shopping_results", [])
        print(f"[ATOMIC_LOG] Candidate search results: {len(results)}")
        matches: list[dict] = []

        for result in results:
            token = result.get("immersive_product_page_token")
            source = result.get("source", "")
            link = result.get("link", "") # Keep link only for domain filtering

            if not token or not source:
                continue

            # Skip known non-store domains if link is present.
            if link:
                domain = urlparse(link).netloc.replace("www.", "").lower()
                if any(skip in domain for skip in _SKIP_ORGANIC_DOMAINS):
                    continue

            matches.append({
                "immersive_product_page_token": token,
                "source": source
            })
            if len(matches) >= 10:
                break

        return matches

    except serpapi.HTTPError:
            return []


def search_immersive_product(page_token: str, source: str) -> dict | None:
    """
    Searches Google Immersive Product via SerpAPI and returns enriched
    product data filtered by the provided source store.
    """
    print(f"[ATOMIC_LOG] Immersive search for source: {source}")
    try:
        client = serpapi.Client(api_key=SERP_API_KEY)
        data = client.search(
            engine="google_immersive_product",
            page_token=page_token,
            hl="en",
            gl="us"
        )

        product_results = data.get("product_results")
        if not product_results:
            print(f"[ATOMIC_LOG] No product_results found for token.")
            return None
        
        # Filter stores for the one matching the source.
        stores = product_results.get("stores", [])
        matching_store = next((s for s in stores if s.get("name") == source), None)
        
        if not matching_store and stores:
            # Fallback to first store if source not found exactly? 
            # The prompt says "who's 'name' matches the 'source' from before".
            # If no match, maybe we should return None or the first one.
            # I'll stick to the match requirement.
            print(f"[ATOMIC_LOG] No store matching source '{source}' found in {len(stores)} stores.")
            return None

        if not matching_store:
            return None

        return {
            "brand": product_results.get("brand", source),
            "title": product_results.get("title", "Unknown"),
            "thumbnails": product_results.get("thumbnails", []),
            "store": {
                "name": matching_store.get("name"),
                "extracted_price": f"${matching_store.get('extracted_price')}",
                "rating": product_results.get("rating", 0.0),
                "logo": matching_store.get("logo", "#"),
                "link": matching_store.get("link")
            },
            "about_the_product": product_results.get("about_the_product", "")
        }

    except serpapi.HTTPError:
        return None
