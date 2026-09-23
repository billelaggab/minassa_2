import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const persons = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  primaryName: varchar("primary_name", { length: 255 }).notNull(),
  aliases: text("aliases"), // JSON array or comma-separated aliases
  avatarUrl: text("avatar_url"),
  dob: varchar("dob", { length: 50 }),
  nationality: varchar("nationality", { length: 100 }),
  occupation: varchar("occupation", { length: 255 }),
  address: text("address"),
  reliabilityRating: integer("reliability_rating").default(3).notNull(), // 1 to 5
  sensitivityLevel: varchar("sensitivity_level", { length: 50 }).default("confidential").notNull(), // 'public' | 'confidential' | 'top_secret'
  status: varchar("status", { length: 50 }).default("under_investigation").notNull(), // 'under_investigation' | 'monitored' | 'source' | 'witness' | 'archived'
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactChannels = pgTable("contact_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id")
    .references(() => persons.id, { onDelete: "cascade" })
    .notNull(),
  channelType: varchar("channel_type", { length: 50 }).notNull(), // 'phone' | 'email' | 'social'
  value: varchar("value", { length: 255 }).notNull(),
  label: varchar("label", { length: 100 }), // 'personal' | 'work' | 'burner' | 'primary' | 'leaked' | 'secure_proton' | 'twitter' | 'telegram' | etc.
  hasWhatsapp: boolean("has_whatsapp").default(false),
  hasSignal: boolean("has_signal").default(false),
  hasTelegram: boolean("has_telegram").default(false),
  carrierNotes: text("carrier_notes"),
  pgpPublicKey: text("pgp_public_key"),
  profileUrl: text("profile_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const intelligenceNotes = pgTable("intelligence_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id")
    .references(() => persons.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'meeting_log' | 'financial_trail' | 'background_check' | 'source_leak' | 'surveillance'
  eventDate: varchar("event_date", { length: 50 }),
  recordingDate: timestamp("recording_date").defaultNow().notNull(),
  isConfidential: boolean("is_confidential").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const relationships = pgTable("relationships", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourcePersonId: uuid("source_person_id")
    .references(() => persons.id, { onDelete: "cascade" })
    .notNull(),
  targetPersonId: uuid("target_person_id")
    .references(() => persons.id, { onDelete: "cascade" })
    .notNull(),
  relationshipType: varchar("relationship_type", { length: 100 }).notNull(), // 'lawyer' | 'business_partner' | 'relative' | 'accomplice' | 'adversary' | 'whistleblower' | 'broker' | 'associate'
  confidenceScore: varchar("confidence_score", { length: 50 }).default("confirmed").notNull(), // 'confirmed' | 'suspected'
  contextNotes: text("context_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  personId: uuid("person_id")
    .references(() => persons.id, { onDelete: "cascade" })
    .notNull(),
  noteId: uuid("note_id").references(() => intelligenceNotes.id, { onDelete: "set null" }),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  storedFilename: varchar("stored_filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  sha256Hash: varchar("sha256_hash", { length: 64 }).notNull(),
  contextDescription: text("context_description"),
  fileData: text("file_data"), // Base64 data URL for self-contained offline storage & instant preview
  isSensitive: boolean("is_sensitive").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }).default("127.0.0.1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
