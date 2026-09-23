import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { persons, contactChannels, intelligenceNotes, attachments, relationships, auditLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { normalizeArabic } from "@/lib/arabic-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const sensitivity = searchParams.get("sensitivity");
    const status = searchParams.get("status");

    const allPersons = await db.select().from(persons).orderBy(desc(persons.updatedAt));

    // Get aggregated counts for each person
    const allContacts = await db.select().from(contactChannels);
    const allNotes = await db.select().from(intelligenceNotes);
    const allFiles = await db.select().from(attachments);
    const allRels = await db.select().from(relationships);

    let filtered = allPersons.map((p) => {
      const contactsCount = allContacts.filter((c) => c.personId === p.id).length;
      const notesCount = allNotes.filter((n) => n.personId === p.id).length;
      const filesCount = allFiles.filter((f) => f.personId === p.id).length;
      const relationsCount = allRels.filter(
        (r) => r.sourcePersonId === p.id || r.targetPersonId === p.id
      ).length;

      return {
        ...p,
        aliasesList: p.aliases ? (JSON.parse(p.aliases) as string[]) : [],
        counts: {
          contacts: contactsCount,
          notes: notesCount,
          files: filesCount,
          relations: relationsCount,
        },
      };
    });

    if (sensitivity && sensitivity !== "all") {
      filtered = filtered.filter((p) => p.sensitivityLevel === sensitivity);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (query.trim()) {
      const normQ = normalizeArabic(query);
      filtered = filtered.filter((p) => {
        const normName = normalizeArabic(p.primaryName);
        const normOcc = normalizeArabic(p.occupation);
        const normAliases = normalizeArabic(p.aliases);
        const normSummary = normalizeArabic(p.summary);

        return (
          normName.includes(normQ) ||
          normOcc.includes(normQ) ||
          normAliases.includes(normQ) ||
          normSummary.includes(normQ)
        );
      });
    }

    return NextResponse.json({ success: true, persons: filtered });
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch persons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    if (!primaryName || !primaryName.trim()) {
      return NextResponse.json({ success: false, error: "الاسم الكامل مطلوب" }, { status: 400 });
    }

    const aliasesString = Array.isArray(aliases)
      ? JSON.stringify(aliases.filter(Boolean))
      : typeof aliases === "string" && aliases.trim()
      ? JSON.stringify(aliases.split(/[,،]+/).map((s: string) => s.trim()).filter(Boolean))
      : JSON.stringify([]);

    const [newPerson] = await db
      .insert(persons)
      .values({
        primaryName: primaryName.trim(),
        aliases: aliasesString,
        avatarUrl: avatarUrl?.trim() || null,
        dob: dob?.trim() || null,
        nationality: nationality?.trim() || null,
        occupation: occupation?.trim() || null,
        address: address?.trim() || null,
        reliabilityRating: Number(reliabilityRating) || 3,
        sensitivityLevel: sensitivityLevel || "confidential",
        status: status || "under_investigation",
        summary: summary?.trim() || null,
      })
      .returning();

    // Log action to audit trail
    await db.insert(auditLogs).values({
      action: "PERSON_CREATED",
      entityType: "person",
      entityId: newPerson.id,
      details: `إنشاء ملف جديد للهدف: ${newPerson.primaryName} بدرجة سرية ${newPerson.sensitivityLevel}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, person: newPerson }, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json({ success: false, error: "Failed to create person" }, { status: 500 });
  }
}
