import uuid

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import RedirectResponse
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from backend.config import settings
from backend.crypto import encrypt_token
from backend import db
from backend.models.schemas import (
    LinkedInProfileResponse,
    LinkedInPublishRequest,
    LinkedInPublishResponse,
    SchedulePostRequest,
    ScheduledPostResponse,
)
from backend.services import linkedin_service

router = APIRouter()

_serializer = URLSafeTimedSerializer(settings.secret_key, salt="linkedin-oauth-state")
STATE_MAX_AGE = 900  # 15 minutes


def _row_to_response(row: dict) -> ScheduledPostResponse:
    return ScheduledPostResponse(
        id=row["id"],
        topic=row["topic"],
        linkedin_post=row["linkedin_post"],
        scheduled_at=row["scheduled_at"],
        status=row["status"],
        post_url=row.get("post_url"),
        error=row.get("error"),
        created_at=row["created_at"],
    )


# ── OAuth ────────────────────────────────────────────────────────────────────

@router.get("/linkedin/auth")
async def linkedin_auth():
    raw_state = str(uuid.uuid4())
    signed_state = _serializer.dumps(raw_state)
    auth_url = linkedin_service.get_auth_url(state=signed_state)
    return RedirectResponse(url=auth_url)


@router.get("/linkedin/callback")
async def linkedin_callback(code: str, state: str):
    try:
        _serializer.loads(state, max_age=STATE_MAX_AGE)
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="OAuth state expired. Please try again.")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid OAuth state.")

    try:
        access_token = await linkedin_service.exchange_code_for_token(code)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Token exchange failed: {exc}")

    redirect_url = f"{settings.frontend_url}/posts?token={access_token}"
    return RedirectResponse(url=redirect_url)


@router.get("/linkedin/profile", response_model=LinkedInProfileResponse)
async def linkedin_profile(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required.")
    token = authorization.removeprefix("Bearer ")
    try:
        profile = await linkedin_service.get_user_profile(token)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return LinkedInProfileResponse(**profile)


# ── Immediate publish ─────────────────────────────────────────────────────────

@router.post("/linkedin/publish", response_model=LinkedInPublishResponse)
async def linkedin_publish(request: LinkedInPublishRequest):
    try:
        result = await linkedin_service.publish_post(
            access_token=request.access_token,
            linkedin_id=request.linkedin_id,
            post_text=request.linkedin_post,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return LinkedInPublishResponse(**result)


# ── Scheduled posts ───────────────────────────────────────────────────────────

@router.post("/linkedin/schedule", response_model=ScheduledPostResponse)
async def schedule_post(request: SchedulePostRequest):
    encrypted_token = encrypt_token(request.access_token)
    try:
        row = db.create_scheduled_post(
            linkedin_post=request.linkedin_post,
            topic=request.topic,
            linkedin_id=request.linkedin_id,
            access_token_encrypted=encrypted_token,
            scheduled_at=request.scheduled_at,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return _row_to_response(row)


@router.get("/linkedin/scheduled", response_model=list[ScheduledPostResponse])
async def list_scheduled(linkedin_id: str | None = None):
    rows = db.list_scheduled_posts(linkedin_id=linkedin_id)
    return [_row_to_response(r) for r in rows]


@router.delete("/linkedin/scheduled/{post_id}")
async def cancel_scheduled(post_id: str):
    cancelled = db.cancel_scheduled_post(post_id)
    if not cancelled:
        raise HTTPException(
            status_code=404,
            detail="Post not found or already published/cancelled.",
        )
    return {"message": "Post cancelled."}
