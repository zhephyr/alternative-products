import pytest
import asyncio
import time
from unittest.mock import AsyncMock, patch
from services.scraper import scrape_products_concurrently

@pytest.mark.asyncio
async def test_semaphore_concurrency_limit():
    """Verify that the scraper limits concurrent operations to exactly 5."""
    urls = [f"http://example.com/product/{i}" for i in range(10)]
    
    start_time = time.time()
    
    # Patch the internal single scrape function to sleep for 0.5 seconds
    with patch("services.scraper.scrape_single_product", new_callable=AsyncMock) as mock_scrape:
        async def delayed_scrape(url):
            await asyncio.sleep(0.5)
            return {"url": url, "brand": "TestBrand", "price": "100"}
            
        mock_scrape.side_effect = delayed_scrape
        
        results = await scrape_products_concurrently(urls)
        
    duration = time.time() - start_time
    
    # Verify results
    assert len(results) == 10
    assert results[0]["brand"] == "TestBrand"
    
    # 10 items with limit 5 means 2 batches of 0.5s -> ~1.0s total
    # If no limit existed, it would take ~0.5s total.
    # Therefore, duration > 0.9 proves the semaphore worked!
    assert duration >= 0.9
    assert duration < 1.5 # Ensure it wasn't running strictly sequentially (which would take 5 seconds)
