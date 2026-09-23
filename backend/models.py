import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base

class Person(Base):
    __tablename__ = "persons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    primary_name = Column(String(255), nullable=False, index=True)
    aliases = Column(Text, nullable=True) # JSON array or comma separated
    avatar_url = Column(Text, nullable=True)
    dob = Column(String(50), nullable=True)
    nationality = Column(String(100), nullable=True)
    occupation = Column(String(255), nullable=True, index=True)
    address = Column(Text, nullable=True)
    reliability_rating = Column(Integer, default=3, nullable=False) # 1 to 5
    sensitivity_level = Column(String(50), default="confidential", nullable=False) # public, confidential, top_secret
    status = Column(String(50), default="under_investigation", nullable=False) # under_investigation, monitored, source, witness, archived
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    contacts = relationship("ContactChannel", back_populates="person", cascade="all, delete-orphan")
    notes = relationship("IntelligenceNote", back_populates="person", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="person", cascade="all, delete-orphan")
    
    # Self-referencing network relationships
    outgoing_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.source_person_id",
        back_populates="source_person",
        cascade="all, delete-orphan"
    )
    incoming_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.target_person_id",
        back_populates="target_person",
        cascade="all, delete-orphan"
    )


class ContactChannel(Base):
    __tablename__ = "contact_channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True)
    channel_type = Column(String(50), nullable=False) # phone, email, social
    value = Column(String(255), nullable=False, index=True)
    label = Column(String(100), nullable=True) # personal, work, burner, leaked, secure_proton
    has_whatsapp = Column(Boolean, default=False)
    has_signal = Column(Boolean, default=False)
    has_telegram = Column(Boolean, default=False)
    carrier_notes = Column(Text, nullable=True)
    pgp_public_key = Column(Text, nullable=True)
    profile_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    person = relationship("Person", back_populates="contacts")


class IntelligenceNote(Base):
    __tablename__ = "intelligence_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # meeting_log, financial_trail, background_check, source_leak, surveillance
    event_date = Column(String(50), nullable=True)
    recording_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_confidential = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    person = relationship("Person", back_populates="notes")
    attachments = relationship("Attachment", back_populates="note")


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    source_person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True)
    target_person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(100), nullable=False) # lawyer, business_partner, relative, accomplice, adversary, whistleblower, broker
    confidence_score = Column(String(50), default="confirmed", nullable=False) # confirmed, suspected
    context_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source_person = relationship("Person", foreign_keys=[source_person_id], back_populates="outgoing_relationships")
    target_person = relationship("Person", foreign_keys=[target_person_id], back_populates="incoming_relationships")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, index=True)
    note_id = Column(UUID(as_uuid=True), ForeignKey("intelligence_notes.id", ondelete="SET NULL"), nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    context_description = Column(Text, nullable=True)
    is_sensitive = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    person = relationship("Person", back_populates="attachments")
    note = relationship("IntelligenceNote", back_populates="attachments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
