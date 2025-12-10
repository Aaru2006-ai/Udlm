from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base  # ensures models are imported


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    # CORS (frontend, extension, desktop app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # production me specific domains
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # DB tables create
    Base.metadata.create_all(bind=engine)

    # API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    def root():
        return {"message": "UDLM backend is running", "project": settings.PROJECT_NAME}

    return app


app = create_app()

