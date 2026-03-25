import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.user import UserCreate, UserResponse, Token, RefreshRequest
from services.db import SessionDB
from utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse)
async def register_user(user_in: UserCreate):
    db = SessionDB()
    if db.get_user_by_username(user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
        
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_in.password)
    
    user_data = {
        "id": user_id,
        "username": user_in.username,
        "hashed_password": hashed_password
    }
    
    db.create_user(user_data)
    
    return UserResponse(id=user_id, username=user_in.username)

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    db = SessionDB()
    user = db.get_user_by_username(form_data.username)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["username"]})
    refresh_token = create_refresh_token(data={"sub": user["username"]})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(request_data: RefreshRequest):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    from jose import JWTError, jwt
    from utils.security import SECRET_KEY, ALGORITHM
    
    try:
        payload = jwt.decode(request_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Issue new access token
    access_token = create_access_token(data={"sub": username})
    
    return {
        "access_token": access_token,
        "refresh_token": request_data.refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return UserResponse(id=current_user["id"], username=current_user["username"])
