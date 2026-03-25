import asyncio

# Limit to 5 concurrent scraping tasks to avoid overwhelming target servers or our machine
MAX_CONCURRENT_SCRAPES = 5
scrape_semaphore = asyncio.Semaphore(MAX_CONCURRENT_SCRAPES)

async def scrape_single_product(url: str) -> dict:
    """
    Scrapes a single product URL for GTIN, UPC, EAN, Brand, Model, and SKU.
    Currently mocked for Phase 3 TDD development.
    """
    # In reality, this would use httpx to fetch the page and BeautifulSoup to parse it
    await asyncio.sleep(0.5)
    return {
        "url": url,
        "brand": "Unknown Brand",
        "price": "Unknown",
        "title": "Mocked Product"
    }

async def scrape_products_concurrently(urls: list[str]) -> list[dict]:
    """
    Takes a list of product URLs and processes them concurrently,
    respecting the semaphore limit to prevent rate limits or memory exhaustion.
    """
    async def bound_scrape(url):
        async with scrape_semaphore:
            return await scrape_single_product(url)
            
    tasks = [bound_scrape(url) for url in urls]
    
    # Run all tasks concurrently and collect results, ignoring individual failures
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out any Exception instances returned by failed tasks
    valid_results = [r for r in results if not isinstance(r, Exception)]
    return valid_results
