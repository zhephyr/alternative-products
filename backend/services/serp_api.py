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
            
            price = top_result.get("extracted_price", 0.0)
            
            # Compute price range for frontend filtering
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
                "priceRange": price_range
            }
        except httpx.HTTPError:
            # Handle rate-limits or timeouts according to instructions
            return None
