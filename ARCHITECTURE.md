# ARCHITECTURE BLUEPRINT: Investigative Contact & Intelligence Management System (CIIS)

## 1. Directory Tree & File Organization

```
├── backend/                              # Python FastAPI Backend Service
│   ├── Dockerfile                        # Multi-stage Dockerfile for FastAPI + WeasyPrint
│   ├── requirements.txt                  # Python production dependencies
│   ├── database.py                       # SQLAlchemy async session & connection pool
│   ├── models.py                         # SQLAlchemy ORM declarative models (Postgres)
│   ├── schemas.py                        # Pydantic v2 schemas for request/response validation
│   ├── main.py                           # FastAPI application endpoints & WeasyPrint PDF router
│   └── meili_sync.py                     # Meilisearch ingestion worker & Arabic normalizer
│
├── nginx/                                # Hardened Nginx Gateway Reverse Proxy
│   └── nginx.conf                        # Isolated reverse-proxy with security headers
│
├── templates/                            # Forensic Dossier Report Templates
│   └── dossier_report.html               # Classified Jinja2 template with Print CSS
│
├── src/                                  # Full-Stack Next.js (App Router) + Drizzle Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts           # System healthcheck endpoint
│   │   │   ├── persons/route.ts          # List & create persons dossiers
│   │   │   ├── persons/[id]/route.ts     # Full dossier fetch, update, delete
│   │   │   ├── persons/[id]/contacts/    # Add contact channel (phone/email/social)
│   │   │   ├── persons/[id]/notes/       # Add intelligence field notes
│   │   │   ├── persons/[id]/attachments/ # File upload with SHA-256 calculation
│   │   │   ├── contacts/[contactId]/     # Delete contact channel
│   │   │   ├── notes/[noteId]/           # Update & delete intelligence notes
│   │   │   ├── attachments/[fileId]/     # File preview, download & deletion
│   │   │   ├── relationships/route.ts    # Network graph nodes & relational edges
│   │   │   ├── search/route.ts           # Instant Arabic-normalized fuzzy search engine
│   │   │   ├── dossier/export/route.ts   # Sanitized printable dossier generator
│   │   │   ├── stats/route.ts            # Investigative intelligence metrics
│   │   │   └── seed/route.ts             # Demo data seeding endpoint
│   │   ├── globals.css                   # Dark mode styling & @media print rules
│   │   ├── layout.tsx                    # RTL layout (dir="rtl", lang="ar")
│   │   └── page.tsx                      # Main investigative command center
│   │
│   ├── components/
│   │   ├── Navbar.tsx                    # Security classification banner & nav tabs
│   │   ├── DossierCard.tsx               # Grid card with sensitivity & reliability stars
│   │   ├── DossierDetail.tsx             # Complete subject dossier with confidential unmasking
│   │   ├── NetworkGraph.tsx              # Interactive visual relational SVG graph
│   │   ├── DossierExportModal.tsx        # Classified print & PDF export engine
│   │   ├── SearchModal.tsx               # Instant search with snippet highlight
│   │   ├── NewPersonModal.tsx            # Add/edit investigative subject dossier
│   │   ├── NewContactModal.tsx           # Add phones, emails with PGP, social handles
│   │   ├── NewNoteModal.tsx              # Add classified field notes
│   │   ├── UploadEvidenceModal.tsx       # Drag-and-drop file upload with SHA-256 hash
│   │   ├── NewRelationshipModal.tsx      # Link entities in the network graph
│   │   ├── MediaLightbox.tsx             # Streamable file/image browser viewer
│   │   └── AuditTrailModal.tsx           # Security access & export audit log viewer
│   │
│   ├── db/
│   │   ├── index.ts                      # PostgreSQL connection via pg & Drizzle
│   │   ├── schema.ts                     # Drizzle ORM PostgreSQL schema
│   │   └── seed.ts                       # Authentic Arabic investigative dossiers seed script
│   │
│   └── lib/
│       └── arabic-search.ts              # Arabic language normalization & fuzzy matching
│
├── Dockerfile                            # Production Dockerfile for Frontend / Fullstack
├── docker-compose.yml                    # Multi-container orchestration (5 isolated services)
├── دليل_التثبيت.md                       # Comprehensive Arabic Deployment & Installation Guide
├── ARCHITECTURE.md                       # This architecture specification
├── package.json                          # Node.js dependencies
└── tsconfig.json                         # TypeScript configuration
```

---

## 2. Relational Schema & Entity Relationships

```
┌─────────────────────────────────┐
│             PERSONS             │
│  - id (UUID)                    │
│  - primary_name (String)        │◄───────┐
│  - aliases (JSON Array)         │        │
│  - avatar_url (Text)            │        │ (1 to Many)
│  - reliability_rating (1 to 5)  │        │
│  - sensitivity_level            │        ├──────────────────────────────────────┐
│  - status                       │        │                                      │
└────────────────┬────────────────┘        │                                      │
                 │                         │                                      │
        (1 to Many)               (1 to Many)                           (Many to Many)
                 │                         │                                      │
                 ▼                         ▼                                      ▼
┌────────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐
│        CONTACT_CHANNELS        │ │      INTELLIGENCE_NOTES       │ │         RELATIONSHIPS         │
│  - id (UUID)                   │ │  - id (UUID)                  │ │  - id (UUID)                  │
│  - person_id (FK)              │ │  - person_id (FK)             │ │  - source_person_id (FK)      │
│  - channel_type (phone/email)  │ │  - title (String)             │ │  - target_person_id (FK)      │
│  - value (E.164 / email)       │ │  - category (meeting/leak...) │ │  - relationship_type (lawyer, │
│  - has_whatsapp/signal/telegram│ │  - is_confidential (Boolean)  │ │    partner, accomplice, ...)  │
│  - pgp_public_key (Text)       │ │  - event_date (String)        │ │  - confidence_score           │
└────────────────────────────────┘ └───────────────┬───────────────┘ └───────────────────────────────┘
                                                   │
                                          (Optional 1 to Many)
                                                   │
                                                   ▼
                                  ┌────────────────────────────────┐
                                  │          ATTACHMENTS           │
                                  │  - id (UUID)                   │
                                  │  - person_id (FK)              │
                                  │  - note_id (FK, Optional)      │
                                  │  - sha256_hash (64-char Hex)   │
                                  │  - stored_filename (UUID-based)│
                                  │  - mime_type (String)          │
                                  │  - is_sensitive (Boolean)      │
                                  └────────────────────────────────┘
```

---

## 3. Security, Privacy & Air-Gapped Specifications

1. **Zero External Calls (Offline Sovereignty):**
   - No external Google fonts or CDN assets.
   - SVG icons rendered locally via Lucide.
   - No external analytics, trackers, or telemetry.

2. **Cryptographic Chain of Custody (SHA-256):**
   - Automatically computes and verifies SHA-256 hashes on all uploaded evidence documents, images, and leaks.
   - Preserves original filenames while isolating stored disk filenames with UUIDs to prevent path traversal attacks.

3. **Classification & Sanitization Engine:**
   - Multi-tier classification: `Public`, `Confidential`, `Top Secret`.
   - Before exporting or printing dossiers, sanitization filters allow investigators to exclude sensitive notes, omit media, or redact source identities.
