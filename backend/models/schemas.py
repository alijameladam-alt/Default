from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UploadResponse(BaseModel):
    job_id: str
    status: str = "queued"


class TranscriptionStatusResponse(BaseModel):
    job_id: str
    status: str  # queued | processing | completed | error
    transcript: Optional[str] = None
    error: Optional[str] = None


class GenerateRequest(BaseModel):
    transcript: str
    tone: str = "professional"  # professional | casual | inspiring


class GeneratedPost(BaseModel):
    topic: str
    linkedin_post: str
    word_count: int
    word_count_warning: bool = False


class GenerateResponse(BaseModel):
    summary: str
    posts: list[GeneratedPost]


class LinkedInProfileResponse(BaseModel):
    linkedin_id: str
    name: str
    profile_picture: Optional[str] = None


class SchedulePostRequest(BaseModel):
    linkedin_post: str
    topic: str
    linkedin_id: str
    access_token: str
    scheduled_at: datetime  # ISO 8601 UTC


class ScheduledPostResponse(BaseModel):
    id: str
    topic: str
    linkedin_post: str
    scheduled_at: datetime
    status: str  # pending | published | failed | cancelled
    post_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime


class CancelScheduledPostRequest(BaseModel):
    post_id: str


class LinkedInPublishRequest(BaseModel):
    linkedin_post: str
    linkedin_id: str
    access_token: str


class LinkedInPublishResponse(BaseModel):
    post_id: str
    post_url: str
