from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import search, stream

app = FastAPI(
    title="alt.it Visual Search API",
    description="Backend API for the visually similar product search application",
    version="0.1.0"
)

# Allow CORS from our Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(stream.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
