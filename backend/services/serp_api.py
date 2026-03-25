import os
import httpx

SERP_API_KEY = os.getenv("SERP_API_KEY")
SERP_API_URL = "https://serpapi.com/search.json"

async def search_google_shopping(query: str) -> dict | None:
    """
    Searches Google Shopping via SerpAPI and returns the best matching product data.
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
                
            # Take the first (most relevant) result
            top_result = results[0]
            
            return {
                "title": top_result.get("title", "Unknown"),
                "price": top_result.get("extracted_price", 0.0),
                "link": top_result.get("link", "#"),
                "imageUrl": top_result.get("thumbnail", ""),
                "rating": top_result.get("rating", 0.0),
                "reviewCount": top_result.get("reviews", 0),
                "source": top_result.get("source", "Unknown Store"),
            }
        except httpx.HTTPError:
            # Handle rate-limits or timeouts according to instructions
            return None
