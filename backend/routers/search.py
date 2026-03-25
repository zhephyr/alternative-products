import uuid
from fastapi import APIRouter, File, UploadFile, BackgroundTasks
from services.db import SessionDB
from services.ai_agent import analyze_image
from services.pipeline import process_visual_search

router = APIRouter(prefix="/api", tags=["search"])

db = SessionDB()

@router.post("/search")
async def search_image(background_tasks: BackgroundTasks, image: UploadFile = File(...)):
    """
    Accepts an image upload, initializes a search session, and triggers processing.
    """
    session_id = str(uuid.uuid4())
    
    # Initialize session in DB
    db.create_session(session_id)
    
    image_bytes = await image.read()
    
    # Spawn background orchestration task
    background_tasks.add_task(
        process_visual_search,
        session_id=session_id,
        image_bytes=image_bytes,
        db=db
    )
    
    return {"session_id": session_id}
