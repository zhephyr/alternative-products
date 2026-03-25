import uuid
from fastapi import APIRouter, File, UploadFile

router = APIRouter(prefix="/api", tags=["search"])

@router.post("/search")
async def search_image(image: UploadFile = File(...)):
    """
    Accepts an image upload and initializes a search session.
    """
    # Generate a unique session ID for this search
    session_id = str(uuid.uuid4())
    
    # Fast return of the session ID
    return {"session_id": session_id}
