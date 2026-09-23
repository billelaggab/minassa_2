from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# ================================
# Contact Channel Schemas
# ================================
class ContactChannelBase(BaseModel):
    channel_type: str = Field(..., description="phone | email | social")
    value: str
    label: Optional[str] = None
    has_whatsapp: Optional[bool] = False
    has_signal: Optional[bool] = False
    has_telegram: Optional[bool] = False
    carrier_notes: Optional[str] = None
    pgp_public_key: Optional[str] = None
    profile_url: Optional[str] = None

class ContactChannelCreate(ContactChannelBase):
    pass

class ContactChannelResponse(ContactChannelBase):
    id: UUID
    person_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ================================
# Intelligence Note Schemas
# ================================
class IntelligenceNoteBase(BaseModel):
    title: str
    content: str
    category: str = Field(..., description="meeting_log | financial_trail | background_check | source_leak | surveillance")
    event_date: Optional[str] = None
    is_confidential: bool = False

class IntelligenceNoteCreate(IntelligenceNoteBase):
    pass

class IntelligenceNoteResponse(IntelligenceNoteBase):
    id: UUID
    person_id: UUID
    recording_date: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ================================
# Attachment Schemas
# ================================
class AttachmentResponse(BaseModel):
    id: UUID
    person_id: UUID
    note_id: Optional[UUID] = None
    original_filename: str
    stored_filename: str
    mime_type: str
    file_size: int
    sha256_hash: str
    context_description: Optional[str] = None
    is_sensitive: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ================================
# Relationship Schemas
# ================================
class RelationshipBase(BaseModel):
    source_person_id: UUID
    target_person_id: UUID
    relationship_type: str
    confidence_score: str = "confirmed"
    context_notes: Optional[str] = None

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipResponse(RelationshipBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# ================================
# Person (Core Dossier) Schemas
# ================================
class PersonBase(BaseModel):
    primary_name: str
    aliases: Optional[str] = None
    avatar_url: Optional[str] = None
    dob: Optional[str] = None
    nationality: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    reliability_rating: int = Field(default=3, ge=1, le=5)
    sensitivity_level: str = "confidential" # public | confidential | top_secret
    status: str = "under_investigation" # under_investigation | monitored | source | witness | archived
    summary: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(BaseModel):
    primary_name: Optional[str] = None
    aliases: Optional[str] = None
    avatar_url: Optional[str] = None
    dob: Optional[str] = None
    nationality: Optional[str] = None
    occupation: Optional[str] = None
    address: Optional[str] = None
    reliability_rating: Optional[int] = Field(default=None, ge=1, le=5)
    sensitivity_level: Optional[str] = None
    status: Optional[str] = None
    summary: Optional[str] = None

class PersonDetailResponse(PersonBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    contacts: List[ContactChannelResponse] = []
    notes: List[IntelligenceNoteResponse] = []
    attachments: List[AttachmentResponse] = []
    model_config = ConfigDict(from_attributes=True)

class PersonSummaryResponse(PersonBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    contacts_count: int = 0
    notes_count: int = 0
    attachments_count: int = 0
    model_config = ConfigDict(from_attributes=True)

# ================================
# Dossier Export Request Schema
# ================================
class DossierExportRequest(BaseModel):
    person_id: UUID
    exclude_confidential: bool = False
    exclude_media: bool = False
    redact_sources: bool = False
    watermark: str = "سري للغاية - ملف استقصائي محمي // TOP SECRET"
