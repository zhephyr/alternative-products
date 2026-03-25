import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api", tags=["stream"])

@router.get("/stream/{session_id}")
async def stream_results(session_id: str, request: Request):
    """
    Streams search results back to the client as they become available.
    """
    async def event_generator():
        yield f"event: connected\ndata: connected {session_id}\n\n"
        
        while True:
            if await request.is_disconnected():
                break
            await asyncio.sleep(1)
            yield "event: ping\ndata: keep-alive\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
