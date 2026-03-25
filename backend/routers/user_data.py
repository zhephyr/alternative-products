from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
from utils.security import get_current_user
from services.db import SessionDB

router = APIRouter(prefix="/api/user", tags=["user_data"])
db = SessionDB()

class FavoriteRequest(BaseModel):
    title: str
    price: str = None
    source: str = None
    image_url: str = None

class HistoryRequest(BaseModel):
    image_url: str
    results: List[Dict[str, Any]]

# ---
# Favorites
# ---
@router.get("/favorites", response_model=List[Dict[str, Any]])
def get_favorites(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return db.get_user_favorites(user_id)

@router.post("/favorites/{product_id}")
def add_favorite(product_id: str, product_data: dict, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Allow arbitrary dict for product_data to stay flexible with frontend, or use Pydantic
    db_ok = db.add_favorite(user_id, product_id, product_data)
    if not db_ok:
        raise HTTPException(status_code=400, detail="Product already favorited")
    return {"message": "Favorite added"}

@router.delete("/favorites/{product_id}")
def remove_favorite(product_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    removed = db.remove_favorite(user_id, product_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Favorite removed"}

# ---
# History
# ---
@router.get("/history", response_model=List[Dict[str, Any]])
def get_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return db.get_user_history(user_id)

@router.post("/history")
def add_history(history_data: HistoryRequest, current_user: dict = Depends(get_current_user)):
    """Manual endpoint for testing, but typically this is called internally by the search router."""
    user_id = current_user["id"]
    db.add_history(user_id, history_data.image_url, history_data.results)
    return {"message": "History saved"}
