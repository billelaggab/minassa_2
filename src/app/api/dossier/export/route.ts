import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { persons, contactChannels, intelligenceNotes, attachments, relationships, auditLogs } from "@/db/schema";
import { eq, or, asc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      personId,
      excludeConfidential = false,
      excludeMedia = false,
      redactSources = false,
      customWatermark = "سري للغاية - ملف استقصائي محمي // TOP SECRET",
    } = body;

    if (!personId) {
      return NextResponse.json({ success: false, error: "معرف الملف مطلوب" }, { status: 400 });
    }

    const [person] = await db.select().from(persons).where(eq(persons.id, personId));
    if (!person) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    // Contacts
    let contacts = await db
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.personId, personId));

    if (redactSources && person.status === "source") {
      contacts = contacts.map((c) => ({
        ...c,
        value: "[محجوب لأغراض أمنية وحماية المصادر]",
        carrierNotes: "[محجوب]",
      }));
    }

    // Notes
    let notes = await db
      .select()
      .from(intelligenceNotes)
      .where(eq(intelligenceNotes.personId, personId))
      .orderBy(asc(intelligenceNotes.eventDate));

    if (excludeConfidential) {
      notes = notes.filter((n) => !n.isConfidential);
    }

    // Attachments
    let files = await db
      .select()
      .from(attachments)
      .where(eq(attachments.personId, personId));

    if (excludeMedia) {
      files = [];
    } else if (excludeConfidential) {
      files = files.filter((f) => !f.isSensitive);
    }

    // Relationships
    const allPersons = await db.select().from(persons);
    const personMap = new Map(allPersons.map((p) => [p.id, p]));

    const relsRaw = await db
      .select()
      .from(relationships)
      .where(or(eq(relationships.sourcePersonId, personId), eq(relationships.targetPersonId, personId)));

    const enrichedRelationships = relsRaw.map((rel) => {
      const isSource = rel.sourcePersonId === personId;
      const otherPersonId = isSource ? rel.targetPersonId : rel.sourcePersonId;
      const otherPerson = personMap.get(otherPersonId);

      return {
        ...rel,
        targetName: otherPerson ? otherPerson.primaryName : "غير معروف",
        targetOccupation: otherPerson ? otherPerson.occupation : "",
        isSource,
      };
    });

    // Audit log
    await db.insert(auditLogs).values({
      action: "DOSSIER_EXPORTED",
      entityType: "person",
      entityId: personId,
      details: `تصدير ملف استقصائي للطباعة/PDF للهدف: ${person.primaryName} (استثناء السري: ${excludeConfidential ? "نعم" : "لا"}، استثناء المرفقات: ${excludeMedia ? "نعم" : "لا"})`,
      ipAddress: "127.0.0.1",
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      watermark: customWatermark,
      sanitizationOptions: {
        excludeConfidential,
        excludeMedia,
        redactSources,
      },
      person: {
        ...person,
        primaryName:
          redactSources && person.status === "source"
            ? "مصدر محمي // REDACTED SOURCE"
            : person.primaryName,
        aliasesList: person.aliases ? JSON.parse(person.aliases) : [],
      },
      contacts,
      notes,
      attachments: files,
      relationships: enrichedRelationships,
    };

    return NextResponse.json({ success: true, dossier: exportData });
  } catch (error) {
    console.error("Dossier export error:", error);
    return NextResponse.json({ success: false, error: "فشل تصدير الملف الاستقصائي" }, { status: 500 });
  }
}
