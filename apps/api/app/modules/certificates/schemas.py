from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CertificateIssueRequest(BaseModel):
    track_id: str = Field(..., min_length=2, max_length=100)
    track_title: str = Field(..., min_length=2, max_length=160)
    recipient_name: Optional[str] = Field(default=None, max_length=120)
    total_exercises: int = Field(default=60, ge=1, le=500)
    qa_preview: bool = Field(default=False)
    verify_base_url: Optional[str] = Field(default=None, max_length=300)


class CertificateDTO(BaseModel):
    id: str
    user_id: str
    track_id: str
    track_title: str
    recipient_name: str
    verification_code: str
    completed_exercises: int
    total_exercises: int
    is_qa_preview: bool = False
    issued_at: datetime
    verify_url: str
    pdf_url: str
    linkedin_url: str
