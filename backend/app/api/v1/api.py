from fastapi import APIRouter

from app.api.v1.endpoints import auth, subscriptions

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(subscriptions.router)
# TODO: include_router for reminders, documents, passwords etc.

