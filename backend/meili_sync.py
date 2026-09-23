import os
import re
import meilisearch
from typing import Dict, Any, List

MEILI_URL = os.getenv("MEILISEARCH_URL", "http://meilisearch:7700")
MEILI_MASTER_KEY = os.getenv("MEILISEARCH_MASTER_KEY", "InvestigativeMasterKey2026_AirGapped")

def get_meili_client():
    try:
        return meilisearch.Client(MEILI_URL, MEILI_MASTER_KEY)
    except Exception as e:
        print(f"Warning: Meilisearch client initialization: {e}")
        return None

def normalize_arabic(text: str) -> str:
    """
    Normalizes Arabic characters:
    - Removes Tashkeel diacritics
    - Normalizes Alef forms (أ/إ/آ -> ا)
    - Normalizes Ta Marbuta (ة -> ه)
    - Normalizes Ya (ي/ى -> ي)
    - Normalizes Hamza on Waw / Ya (ؤ -> و, ئ -> ي)
    """
    if not text:
        return ""
    text = re.sub(r"[\u064B-\u0652\u0653-\u065F\u0670\u0640]", "", str(text))
    text = re.sub(r"[أإآٱ]", "ا", text)
    text = re.sub(r"ة", "ه", text)
    text = re.sub(r"[يى]", "ي", text)
    text = re.sub(r"ؤ", "و", text)
    text = re.sub(r"ئ", "ي", text)
    return text.lower().strip()

def initialize_search_indexes():
    """Configures Meilisearch indexes with Arabic typo tolerance and searchable attributes."""
    client = get_meili_client()
    if not client:
        return

    try:
        index = client.index("persons_dossier")
        index.update_settings({
            "searchableAttributes": [
                "primary_name",
                "normalized_name",
                "aliases",
                "occupation",
                "summary",
                "contact_values",
                "notes_content",
                "attachment_names",
                "sha256_hashes",
            ],
            "filterableAttributes": [
                "sensitivity_level",
                "status",
                "reliability_rating",
                "nationality"
            ],
            "rankingRules": [
                "words",
                "typo",
                "proximity",
                "attribute",
                "sort",
                "exactness"
            ],
            "typoTolerance": {
                "enabled": True,
                "minWordSizeForTypos": {
                    "oneTypo": 3,
                    "twoTypos": 6
                }
            }
        })
        print("Meilisearch 'persons_dossier' index configured successfully.")
    except Exception as e:
        print(f"Meilisearch index initialization error: {e}")

async def sync_person_to_meili(person_id: str, db_session):
    """Syncs a person dossier and all child records to Meilisearch."""
    from models import Person, ContactChannel, IntelligenceNote, Attachment
    from sqlalchemy import select

    client = get_meili_client()
    if not client:
        return

    try:
        stmt = select(Person).where(Person.id == person_id)
        res = await db_session.execute(stmt)
        person = res.scalar_one_or_none()
        if not person:
            return

        # Fetch contacts
        stmt_c = select(ContactChannel).where(ContactChannel.person_id == person_id)
        contacts = (await db_session.execute(stmt_c)).scalars().all()
        contact_vals = [c.value for c in contacts]

        # Fetch notes
        stmt_n = select(IntelligenceNote).where(IntelligenceNote.person_id == person_id)
        notes = (await db_session.execute(stmt_n)).scalars().all()
        notes_text = " ".join([f"{n.title} {n.content}" for n in notes])

        # Fetch attachments
        stmt_a = select(Attachment).where(Attachment.person_id == person_id)
        files = (await db_session.execute(stmt_a)).scalars().all()
        file_names = [f.original_filename for f in files]
        hashes = [f.sha256_hash for f in files]

        doc = {
            "id": str(person.id),
            "primary_name": person.primary_name,
            "normalized_name": normalize_arabic(person.primary_name),
            "aliases": person.aliases or "",
            "occupation": person.occupation or "",
            "summary": person.summary or "",
            "sensitivity_level": person.sensitivity_level,
            "status": person.status,
            "reliability_rating": person.reliability_rating,
            "contact_values": contact_vals,
            "notes_content": notes_text,
            "attachment_names": file_names,
            "sha256_hashes": hashes,
        }

        index = client.index("persons_dossier")
        index.add_documents([doc])
    except Exception as e:
        print(f"Meilisearch sync error for person {person_id}: {e}")
