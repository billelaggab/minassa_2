import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { persons, contactChannels, intelligenceNotes, attachments, relationships, auditLogs } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const [person] = await db.select().from(persons).where(eq(persons.id, id));
    if (!person) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    const contacts = await db
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.personId, id))
      .orderBy(desc(contactChannels.createdAt));

    const notes = await db
      .select()
      .from(intelligenceNotes)
      .where(eq(intelligenceNotes.personId, id))
      .orderBy(desc(intelligenceNotes.createdAt));

    const files = await db
      .select()
      .from(attachments)
      .where(eq(attachments.personId, id))
      .orderBy(desc(attachments.createdAt));

    const allPersons = await db.select().from(persons);
    const personMap = new Map(allPersons.map((p) => [p.id, p]));

    // Fetch relationships where person is source or target
    const relsRaw = await db
      .select()
      .from(relationships)
      .where(or(eq(relationships.sourcePersonId, id), eq(relationships.targetPersonId, id)));

    const enrichedRelationships = relsRaw.map((rel) => {
      const isSource = rel.sourcePersonId === id;
      const otherPersonId = isSource ? rel.targetPersonId : rel.sourcePersonId;
      const otherPerson = personMap.get(otherPersonId);

      return {
        ...rel,
        isSource,
        otherPerson: otherPerson
          ? {
              id: otherPerson.id,
              primaryName: otherPerson.primaryName,
              avatarUrl: otherPerson.avatarUrl,
              occupation: otherPerson.occupation,
              sensitivityLevel: otherPerson.sensitivityLevel,
              status: otherPerson.status,
            }
          : null,
      };
    });

    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.entityId, id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20);

    // Audit dossier view
    await db.insert(auditLogs).values({
      action: "DOSSIER_VIEWED",
      entityType: "person",
      entityId: person.id,
      details: `استعراض الملف الاستقصائي للهدف: ${person.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      person: {
        ...person,
        aliasesList: person.aliases ? (JSON.parse(person.aliases) as string[]) : [],
      },
      contacts,
      notes,
      attachments: files,
      relationships: enrichedRelationships,
      auditLogs: logs,
    });
  } catch (error) {
    console.error("Error fetching dossier:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dossier" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    const [existing] = await db.select().from(persons).where(eq(persons.id, id));
    if (!existing) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    const {
      primaryName,
      aliases,
      avatarUrl,
      dob,
      nationality,
      occupation,
      address,
      reliabilityRating,
      sensitivityLevel,
      status,
      summary,
    } = body;

    const aliasesString = Array.isArray(aliases)
      ? JSON.stringify(aliases.filter(Boolean))
      : typeof aliases === "string" && aliases.trim()
      ? JSON.stringify(aliases.split(/[,،]+/).map((s: string) => s.trim()).filter(Boolean))
      : existing.aliases;

    const [updated] = await db
      .update(persons)
      .set({
        primaryName: primaryName?.trim() ?? existing.primaryName,
        aliases: aliasesString,
        avatarUrl: avatarUrl !== undefined ? avatarUrl?.trim() || null : existing.avatarUrl,
        dob: dob !== undefined ? dob?.trim() || null : existing.dob,
        nationality: nationality !== undefined ? nationality?.trim() || null : existing.nationality,
        occupation: occupation !== undefined ? occupation?.trim() || null : existing.occupation,
        address: address !== undefined ? address?.trim() || null : existing.address,
        reliabilityRating: reliabilityRating !== undefined ? Number(reliabilityRating) : existing.reliabilityRating,
        sensitivityLevel: sensitivityLevel ?? existing.sensitivityLevel,
        status: status ?? existing.status,
        summary: summary !== undefined ? summary?.trim() || null : existing.summary,
        updatedAt: new Date(),
      })
      .where(eq(persons.id, id))
      .returning();

    await db.insert(auditLogs).values({
      action: "DOSSIER_UPDATED",
      entityType: "person",
      entityId: id,
      details: `تحديث بيانات الملف الاستقصائي: ${updated.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, person: updated });
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json({ success: false, error: "Failed to update person" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const [existing] = await db.select().from(persons).where(eq(persons.id, id));
    if (!existing) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    await db.delete(persons).where(eq(persons.id, id));

    await db.insert(auditLogs).values({
      action: "DOSSIER_DELETED",
      entityType: "person",
      entityId: id,
      details: `حذف الملف الاستقصائي بالكامل: ${existing.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "تم حذف الملف بنجاح" });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json({ success: false, error: "Failed to delete person" }, { status: 500 });
  }
}
