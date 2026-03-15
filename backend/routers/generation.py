from fastapi import APIRouter, HTTPException

from backend.models.schemas import GenerateRequest, GenerateResponse
from backend.services import claude_service

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_posts(request: GenerateRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript must not be empty.")
    try:
        result = await claude_service.generate_linkedin_posts(
            transcript=request.transcript,
            tone=request.tone,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return GenerateResponse(**result)
