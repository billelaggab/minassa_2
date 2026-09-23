import os
import uuid
import hashlib
import aiofiles
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from jinja2 import Environment, FileSystemLoader

from database import get_db, engine, Base
import models
import schemas
from meili_sync import sync_person_to_meili, initialize_search_indexes, normalize_arabic, get_meili_client

STORAGE_DIR = os.getenv("STORAGE_DIR", "/app/storage/uploads")
os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(
    title="Investigative Contact & Intelligence Management API",
    version="2.6.0",
    description="نظام إدارة جهات الاتصال والمعلومات الاستخباراتية الاستقصائية",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Jinja2 environment for PDF / HTML dossier export
jinja_env = Environment(loader=FileSystemLoader("templates"))

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    initialize_search_indexes()

@app.get("/api/health")
async def health():
    return {"status": "ok", "system": "air-gapped-investigative-os", "timestamp": datetime.utcnow().isoformat()}

# ====================================================
# Persons CRUD Endpoints
# ====================================================
@app.get("/api/persons", response_model=List[schemas.PersonSummaryResponse])
async def list_persons(
    q: Optional[str] = None,
    sensitivity: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(models.Person).order_by(desc(models.Person.updated_at))

    if sensitivity and sensitivity != "all":
        stmt = stmt.where(models.Person.sensitivity_level == sensitivity)
    if status and status != "all":
        stmt = stmt.where(models.Person.status == status)
    if q:
        norm_q = f"%{q}%"
        stmt = stmt.where(
            or_(
                models.Person.primary_name.ilike(norm_q),
                models.Person.occupation.ilike(norm_q),
                models.Person.aliases.ilike(norm_q),
                models.Person.summary.ilike(norm_q),
            )
        )

    result = await db.execute(stmt)
    persons = result.scalars().all()

    response_list = []
    for p in persons:
        # fetch child counts
        stmt_c = select(models.ContactChannel).where(models.ContactChannel.person_id == p.id)
        c_count = len((await db.execute(stmt_c)).scalars().all())

        stmt_n = select(models.IntelligenceNote).where(models.IntelligenceNote.person_id == p.id)
        n_count = len((await db.execute(stmt_n)).scalars().all())

        stmt_a = select(models.Attachment).where(models.Attachment.person_id == p.id)
        a_count = len((await db.execute(stmt_a)).scalars().all())

        item = schemas.PersonSummaryResponse.model_validate(p)
        item.contacts_count = c_count
        item.notes_count = n_count
        item.attachments_count = a_count
        response_list.append(item)

    return response_list

@app.post("/api/persons", response_model=schemas.PersonDetailResponse, status_code=201)
async def create_person(payload: schemas.PersonCreate, db: AsyncSession = Depends(get_db)):
    person = models.Person(**payload.model_dump())
    db.add(person)
    await db.commit()
    await db.refresh(person)

    # Audit log
    audit = models.AuditLog(
        action="PERSON_CREATED",
        entity_type="person",
        entity_id=str(person.id),
        details=f"إنشاء ملف جديد للهدف: {person.primary_name}",
    )
    db.add(audit)
    await db.commit()

    # Sync to Meilisearch
    await sync_person_to_meili(str(person.id), db)

    return person

@app.get("/api/persons/{person_id}", response_model=schemas.PersonDetailResponse)
async def get_person_dossier(person_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == person_id)
    res = await db.execute(stmt)
    person = res.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    # Fetch contacts, notes, attachments
    stmt_c = select(models.ContactChannel).where(models.ContactChannel.person_id == person_id)
    person.contacts = (await db.execute(stmt_c)).scalars().all()

    stmt_n = select(models.IntelligenceNote).where(models.IntelligenceNote.person_id == person_id)
    person.notes = (await db.execute(stmt_n)).scalars().all()

    stmt_a = select(models.Attachment).where(models.Attachment.person_id == person_id)
    person.attachments = (await db.execute(stmt_a)).scalars().all()

    # Audit log
    audit = models.AuditLog(
        action="DOSSIER_VIEWED",
        entity_type="person",
        entity_id=str(person.id),
        details=f"استعراض الملف الاستقصائي للهدف: {person.primary_name}",
    )
    db.add(audit)
    await db.commit()

    return person

@app.put("/api/persons/{person_id}", response_model=schemas.PersonDetailResponse)
async def update_person(person_id: uuid.UUID, payload: schemas.PersonUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == person_id)
    res = await db.execute(stmt)
    person = res.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(person, field, val)

    person.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(person)

    # Sync to Meilisearch
    await sync_person_to_meili(str(person.id), db)

    return person

@app.delete("/api/persons/{person_id}")
async def delete_person(person_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == person_id)
    res = await db.execute(stmt)
    person = res.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    await db.delete(person)
    await db.commit()

    # Delete from Meilisearch
    client = get_meili_client()
    if client:
        try:
            client.index("persons_dossier").delete_document(str(person_id))
        except Exception:
            pass

    return {"message": "تم حذف الملف بنجاح"}

# ====================================================
# Contact Channels Endpoints
# ====================================================
@app.post("/api/persons/{person_id}/contacts", response_model=schemas.ContactChannelResponse, status_code=201)
async def add_contact_channel(person_id: uuid.UUID, payload: schemas.ContactChannelCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == person_id)
    person = (await db.execute(stmt)).scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الشخص غير موجود")

    contact = models.ContactChannel(person_id=person_id, **payload.model_dump())
    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    # Sync person to meili
    await sync_person_to_meili(str(person_id), db)
    return contact

@app.delete("/api/contacts/{contact_id}")
async def delete_contact(contact_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(models.ContactChannel).where(models.ContactChannel.id == contact_id)
    contact = (await db.execute(stmt)).scalar_one_or_none()
    if not contact:
        raise HTTPException(status_code=404, detail="القناة غير موجودة")

    person_id = contact.person_id
    await db.delete(contact)
    await db.commit()
    await sync_person_to_meili(str(person_id), db)
    return {"message": "تم حذف قناة الاتصال"}

# ====================================================
# Intelligence Notes Endpoints
# ====================================================
@app.post("/api/persons/{person_id}/notes", response_model=schemas.IntelligenceNoteResponse, status_code=201)
async def add_intelligence_note(person_id: uuid.UUID, payload: schemas.IntelligenceNoteCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == person_id)
    person = (await db.execute(stmt)).scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الشخص غير موجود")

    note = models.IntelligenceNote(person_id=person_id, **payload.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)

    await sync_person_to_meili(str(person_id), db)
    return note

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(models.IntelligenceNote).where(models.IntelligenceNote.id == note_id)
    note = (await db.execute(stmt)).scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="الملاحظة غير موجودة")

    person_id = note.person_id
    await db.delete(note)
    await db.commit()
    await sync_person_to_meili(str(person_id), db)
    return {"message": "تم حذف الملاحظة"}

# ====================================================
# Attachments & Forensic Evidence (SHA-256)
# ====================================================
@app.post("/api/persons/{person_id}/attachments", response_model=schemas.AttachmentResponse, status_code=201)
async def upload_attachment(
    person_id: uuid.UUID,
    file: UploadFile = File(...),
    context_description: Optional[str] = Form(None),
    note_id: Optional[uuid.UUID] = Form(None),
    is_sensitive: bool = Form(False),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(models.Person).where(models.Person.id == person_id)
    person = (await db.execute(stmt)).scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الشخص غير موجود")

    # Path traversal protection: sanitize filename
    clean_filename = os.path.basename(file.filename or "evidence.bin").replace("/", "_").replace("\\", "_")
    stored_name = f"custody_{uuid.uuid4()}_{clean_filename}"
    file_path = os.path.join(STORAGE_DIR, stored_name)

    # Read bytes and compute cryptographic SHA-256 hash
    hasher = hashlib.sha256()
    size = 0
    async with aiofiles.open(file_path, "wb") as out_file:
        while content := await file.read(1024 * 1024):
            size += len(content)
            hasher.update(content)
            await out_file.write(content)

    sha256_hash = hasher.hexdigest()

    attachment = models.Attachment(
        person_id=person_id,
        note_id=note_id,
        original_filename=clean_filename,
        stored_filename=stored_name,
        mime_type=file.content_type or "application/octet-stream",
        file_size=size,
        sha256_hash=sha256_hash,
        context_description=context_description,
        is_sensitive=is_sensitive,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    # Audit log
    audit = models.AuditLog(
        action="EVIDENCE_CHAIN_RECORDED",
        entity_type="attachment",
        entity_id=str(attachment.id),
        details=f"إيداع حرز رقمي: {clean_filename} (SHA-256: {sha256_hash[:16]}...)",
    )
    db.add(audit)
    await db.commit()

    await sync_person_to_meili(str(person_id), db)
    return attachment

@app.get("/api/attachments/{attachment_id}/download")
async def download_attachment(attachment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Attachment).where(models.Attachment.id == attachment_id)
    att = (await db.execute(stmt)).scalar_one_or_none()
    if not att:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    file_path = os.path.join(STORAGE_DIR, att.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="الملف غير موجود على القرص")

    return FileResponse(file_path, filename=att.original_filename, media_type=att.mime_type)

# ====================================================
# Relationships / Network Graph
# ====================================================
@app.get("/api/relationships")
async def get_relationships(db: AsyncSession = Depends(get_db)):
    stmt_p = select(models.Person)
    persons = (await db.execute(stmt_p)).scalars().all()
    p_map = {str(p.id): p for p in persons}

    stmt_r = select(models.Relationship)
    rels = (await db.execute(stmt_r)).scalars().all()

    enriched = []
    for r in rels:
        s = p_map.get(str(r.source_person_id))
        t = p_map.get(str(r.target_person_id))
        enriched.append({
            "id": str(r.id),
            "source_person_id": str(r.source_person_id),
            "target_person_id": str(r.target_person_id),
            "relationship_type": r.relationship_type,
            "confidence_score": r.confidence_score,
            "context_notes": r.context_notes,
            "source_person": {"primary_name": s.primary_name, "avatar_url": s.avatar_url} if s else None,
            "target_person": {"primary_name": t.primary_name, "avatar_url": t.avatar_url} if t else None,
        })

    nodes = [
        {
            "id": str(p.id),
            "name": p.primary_name,
            "occupation": p.occupation,
            "avatarUrl": p.avatar_url,
            "sensitivityLevel": p.sensitivity_level,
            "status": p.status,
            "reliabilityRating": p.reliability_rating,
        }
        for p in persons
    ]

    return {"nodes": nodes, "relationships": enriched}

@app.post("/api/relationships", response_model=schemas.RelationshipResponse, status_code=201)
async def create_relationship(payload: schemas.RelationshipCreate, db: AsyncSession = Depends(get_db)):
    rel = models.Relationship(**payload.model_dump())
    db.add(rel)
    await db.commit()
    await db.refresh(rel)
    return rel

# ====================================================
# WeasyPrint Dossier PDF Rendering Endpoint
# ====================================================
@app.post("/api/dossier/generate-pdf")
async def generate_dossier_pdf(payload: schemas.DossierExportRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(models.Person).where(models.Person.id == payload.person_id)
    person = (await db.execute(stmt)).scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="الملف غير موجود")

    # Fetch contacts
    stmt_c = select(models.ContactChannel).where(models.ContactChannel.person_id == payload.person_id)
    contacts = (await db.execute(stmt_c)).scalars().all()

    # Fetch notes
    stmt_n = select(models.IntelligenceNote).where(models.IntelligenceNote.person_id == payload.person_id)
    if payload.exclude_confidential:
        stmt_n = stmt_n.where(models.IntelligenceNote.is_confidential == False)
    notes = (await db.execute(stmt_n)).scalars().all()

    # Fetch attachments
    stmt_a = select(models.Attachment).where(models.Attachment.person_id == payload.person_id)
    attachments = [] if payload.exclude_media else (await db.execute(stmt_a)).scalars().all()

    # Render Jinja2 template
    try:
        template = jinja_env.get_template("dossier_report.html")
        html_out = template.render(
            person=person,
            contacts=contacts,
            notes=notes,
            attachments=attachments,
            watermark=payload.watermark,
            export_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ أثناء تجهيز القالب: {str(e)}")

    # Render with WeasyPrint if available
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_out).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="dossier_{person.primary_name}.pdf"'}
        )
    except ImportError:
        # Fallback to HTML if WeasyPrint native libs are missing
        return Response(content=html_out, media_type="text/html")
