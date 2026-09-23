import { NextResponse } from "next/server";
import { db } from "@/db";
import { persons, contactChannels, intelligenceNotes, relationships, attachments } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [totalPersons] = await db.select({ count: count() }).from(persons);
    const [topSecretPersons] = await db
      .select({ count: count() })
      .from(persons)
      .where(eq(persons.sensitivityLevel, "top_secret"));
    const [activeSources] = await db
      .select({ count: count() })
      .from(persons)
      .where(eq(persons.status, "source"));
    const [totalNotes] = await db.select({ count: count() }).from(intelligenceNotes);
    const [confidentialNotes] = await db
      .select({ count: count() })
      .from(intelligenceNotes)
      .where(eq(intelligenceNotes.isConfidential, true));
    const [totalRelationships] = await db.select({ count: count() }).from(relationships);
    const [totalAttachments] = await db.select({ count: count() }).from(attachments);
    const [totalContacts] = await db.select({ count: count() }).from(contactChannels);

    return NextResponse.json({
      success: true,
      stats: {
        totalPersons: totalPersons.count,
        topSecretPersons: topSecretPersons.count,
        activeSources: activeSources.count,
        totalNotes: totalNotes.count,
        confidentialNotes: confidentialNotes.count,
        totalRelationships: totalRelationships.count,
        totalAttachments: totalAttachments.count,
        totalContacts: totalContacts.count,
        lastSync: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
