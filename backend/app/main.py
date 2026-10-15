import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import (
    auth_routes,
    clients_routes,
    analyzer_routes,
    proposals_routes,
    outreach_routes,
    scheduler_routes,
    tasks_routes,
    analytics_routes,
    admin_routes
)

# Ensure tables and seed exist
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="TaskMate AI API",
    description="Backend API for TaskMate AI: An Intelligent Personal Assistant for Freelancers",
    version="1.0.0"
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_routes.router)
app.include_router(clients_routes.router)
app.include_router(analyzer_routes.router)
app.include_router(proposals_routes.router)
app.include_router(outreach_routes.router)
app.include_router(scheduler_routes.router)
app.include_router(tasks_routes.router)
app.include_router(analytics_routes.router)
app.include_router(admin_routes.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "TaskMate AI",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
