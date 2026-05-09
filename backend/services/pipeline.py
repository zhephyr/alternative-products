"""
pipeline.py — Background orchestration for the visual product search flow.

Steps executed for every search session:
  1. Analyze the uploaded image with an AI Vision model to extract semantic
     product attributes (category, color, keywords).
  2. Use those attributes to perform a real Google Search via SerpAPI
     (search_google_organic) to discover candidate product page URLs.
  3. Scrape each candidate URL concurrently (bounded by a semaphore)
     to extract brand, title, and price, filtering out-of-stock pages.
  4. For each candidate product, query the SerpAPI Google Immersive Product
     endpoint to get enriched product data and progressively emit results
     to the session database so the SSE stream can deliver them to the client.
  5. Mark the session completed (or error) and log to the user's history.
"""

import asyncio
import uuid

from services.db import SessionDB
from services.ai_agent import analyze_image
from services.serp_api import search_immersive_product, fetch_candidate_urls


async def process_visual_search(session_id: str, image_bytes: bytes, db: SessionDB):
    """
    Background pipeline coordinating AI analysis and SerpAPI Immersive Product enrichment.
    """
    print(f"[ATOMIC_LOG] [SESSION {session_id}] Entering process_visual_search")
    try:
        # 1. Analyze image via Vision API to extract semantic product attributes.
        ai_data = await analyze_image(image_bytes)
        print(f"[ATOMIC_LOG] [SESSION {session_id}] AI Analysis Result: {ai_data}")

        # 2. Use AI-extracted attributes to find real candidate products via
        #    a Google organic search — now returns list of dicts with metadata.
        candidates = fetch_candidate_urls(ai_data)
        print(f"[ATOMIC_LOG] [SESSION {session_id}] Organic Candidates found: {len(candidates)}")

        if not candidates:
            db.update_status(session_id, "completed")
            return

        # 3. For each candidate product, fetch SerpAPI Immersive data and stream
        #    results into the session DB as they arrive.
        async def fetch_and_save(candidate: dict):
            token = candidate.get("immersive_product_page_token")
            source = candidate.get("source", "")
            
            print(f"[ATOMIC_LOG] [SESSION {session_id}] Querying Immersive for: {source}")
            product_data = search_immersive_product(token, source)

            if product_data:
                # Assign a unique ID so the frontend can key on it.
                product_data["id"] = str(uuid.uuid4())
                print(f"[ATOMIC_LOG] [SESSION {session_id}] Immersive data found for '{source}': {product_data['title']}")
                db.add_result(session_id, product_data)
            else:
                print(f"[ATOMIC_LOG] [SESSION {session_id}] No immersive data for '{source}'")

        # Run SerpAPI lookups concurrently; ignore individual lookup failures.
        tasks = [fetch_and_save(c) for c in candidates]
        await asyncio.gather(*tasks, return_exceptions=True)

    except Exception as e:
        # Broad catch for background task safety — log and surface to the stream.
        print(f"Pipeline error for session {session_id}: {e}")
        db.update_status(session_id, "error")
        return

    # Mark the session entirely completed when all products have been processed.
    db.update_status(session_id, "completed")

    # Log to user history if the search was made by an authenticated user.
    session = db.get_session(session_id)
    if session and session.get("user_id"):
        db.add_history(
            session["user_id"],
            session.get("image_url", "image.jpg"),
            session.get("results", []),
        )
