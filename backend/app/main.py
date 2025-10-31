from fastapi import FastAPI
from app.models import Base  # Import all models
from app.routes import admin, user
from app.services.scheduler import start_scheduler
from app.utils.db import engine
from fastapi.middleware.cors import CORSMiddleware

# Create all tables once on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlertSphere API", version="0.1")

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://alert-sphere-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(user.router)

@app.on_event("startup")
def on_startup():
    start_scheduler()

@app.get("/")
def root():
    return {"message": "Welcome to AlertSphere!"}
