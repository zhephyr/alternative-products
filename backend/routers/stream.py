import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api", tags=["stream"])

import json
from services.db import SessionDB

db = SessionDB()

@router.get("/stream/{session_id}")
async def stream_results(session_id: str, request: Request):
    """
    Streams search results back to the client as they become available.
    """
    async def event_generator():
        yield f"event: connected\ndata: connected {session_id}\n\n"
        
        last_yielded_index = 0
        
        while True:
            if await request.is_disconnected():
                break
                
            session = db.get_session(session_id)
            if not session:
                yield "event: error\ndata: session not found\n\n"
                break
                
            # Yield any new results
            results = session.get("results", [])
            while last_yielded_index < len(results):
                new_item = results[last_yielded_index]
                yield f"event: new_product\ndata: {json.dumps(new_item)}\n\n"
                last_yielded_index += 1
                
            # Check completion status
            status = session.get("status")
            if status == "completed":
                yield "event: complete\ndata: search finished\n\n"
                break
            elif status == "error":
                yield "event: error\ndata: pipeline error\n\n"
                break
                
            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
