import asyncio
from services.db import SessionDB
from services.ai_agent import analyze_image
from services.scraper import scrape_products_concurrently
from services.serp_api import search_google_shopping

async def process_visual_search(session_id: str, image_bytes: bytes, db: SessionDB):
    """
    Background pipeline coordinating the AI analysis, web scraping, and SerpAPI lookup.
    """
    try:
        # 1. Analyze image via Vision API to get product semantic details
        ai_data = await analyze_image(image_bytes)
        
        # In a real organic search, we'd use ai_data ("keyword", "category") 
        # to fetch top URLs via Google Search. We'll mock the candidate URLs for now.
        candidate_urls = [
            f"http://example.com/product/{i}" for i in range(5)
        ]
        
        if not candidate_urls:
             db.update_status(session_id, "completed")
             return
             
        # 2. Scrape product pages concurrently (bounded by semaphore)
        scraped_products = await scrape_products_concurrently(candidate_urls)
        
        # 3. For each viable extracted brand/product, fetch SerpAPI Shopping data
        # We process them sequentially or concurrently and progressively emit to DB
        async def fetch_and_save(product: dict):
            # Formulate query from extracted brand, Model, or SKU
            query = f"{product.get('brand', '')} {product.get('title', '')}".strip()
            
            # Get Google Shopping data
            shopping_data = await search_google_shopping(query)
            
            if shopping_data:
                # Provide a unique ID and merge known data
                import uuid
                shopping_data["id"] = str(uuid.uuid4())
                
                # Save into the session database so the SSE stream can pick it up
                db.add_result(session_id, shopping_data)

        # Run SerpAPI lookups concurrently
        tasks = [fetch_and_save(p) for p in scraped_products if p.get('title')]
        await asyncio.gather(*tasks, return_exceptions=True)

    except Exception as e:
        # Broad catch for background task safety
        print(f"Pipeline error for session {session_id}: {e}")
        db.update_status(session_id, "error")
        return

    # Mark the session entirely completed when finished processing
    db.update_status(session_id, "completed")
