import uuid
from typing import Optional
from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Depends
from services.db import SessionDB
from services.ai_agent import analyze_image
from services.pipeline import process_visual_search
from utils.security import get_current_user_optional

router = APIRouter(prefix="/api", tags=["search"])

db = SessionDB()

@router.post("/search")
async def search_image(background_tasks: BackgroundTasks, image: UploadFile = File(...), current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Accepts an image upload, initializes a search session, and triggers processing.
    """
    print(f"[ATOMIC_LOG] Entering search_image route handler", flush=True)
    session_id = str(uuid.uuid4())
    user_id = current_user["id"] if current_user else None
    
    # Initialize session in DB
    db.create_session(session_id, user_id=user_id, image_url=image.filename)
    
    image_bytes = await image.read()
    
    # Spawn background orchestration task
    print(f"[ATOMIC_LOG] [SESSION {session_id}] Triggering background_tasks.add_task...", flush=True)
    background_tasks.add_task(
        process_visual_search,
        session_id=session_id,
        image_bytes=image_bytes,
        db=db
    )
    print(f"[ATOMIC_LOG] [SESSION {session_id}] Task added to background_tasks queue.", flush=True)
    
    return {"session_id": session_id}
