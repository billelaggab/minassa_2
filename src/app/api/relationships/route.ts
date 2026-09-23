import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { relationships, persons, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allPersons = await db.select().from(persons);
    const personMap = new Map(allPersons.map((p) => [p.id, p]));

    const allRels = await db.select().from(relationships);

    const enrichedRelationships = allRels.map((r) => {
      const source = personMap.get(r.sourcePersonId);
      const target = personMap.get(r.targetPersonId);

      return {
        id: r.id,
        sourcePersonId: r.sourcePersonId,
        targetPersonId: r.targetPersonId,
        relationshipType: r.relationshipType,
        confidenceScore: r.confidenceScore,
        contextNotes: r.contextNotes,
        createdAt: r.createdAt,
        sourcePerson: source
          ? {
              id: source.id,
              primaryName: source.primaryName,
              avatarUrl: source.avatarUrl,
              occupation: source.occupation,
              sensitivityLevel: source.sensitivityLevel,
              status: source.status,
            }
          : null,
        targetPerson: target
          ? {
              id: target.id,
              primaryName: target.primaryName,
              avatarUrl: target.avatarUrl,
              occupation: target.occupation,
              sensitivityLevel: target.sensitivityLevel,
              status: target.status,
            }
          : null,
      };
    });

    const nodes = allPersons.map((p) => ({
      id: p.id,
      name: p.primaryName,
      occupation: p.occupation,
      avatarUrl: p.avatarUrl,
      sensitivityLevel: p.sensitivityLevel,
      status: p.status,
      reliabilityRating: p.reliabilityRating,
    }));

    return NextResponse.json({
      success: true,
      nodes,
      relationships: enrichedRelationships,
    });
  } catch (error) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json({ success: false, error: "فشل استرجاع شبكة العلاقات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourcePersonId, targetPersonId, relationshipType, confidenceScore, contextNotes } = body;

    if (!sourcePersonId || !targetPersonId || !relationshipType) {
      return NextResponse.json(
        { success: false, error: "الشخص المصدر والهدف ونوع العلاقة بيانات مطلوبة" },
        { status: 400 }
      );
    }

    if (sourcePersonId === targetPersonId) {
      return NextResponse.json(
        { success: false, error: "لا يمكن ربط الشخص بنفسه" },
        { status: 400 }
      );
    }

    const [newRel] = await db
      .insert(relationships)
      .values({
        sourcePersonId,
        targetPersonId,
        relationshipType,
        confidenceScore: confidenceScore || "confirmed",
        contextNotes: contextNotes?.trim() || null,
      })
      .returning();

    await db.insert(auditLogs).values({
      action: "RELATIONSHIP_LINKED",
      entityType: "relationship",
      entityId: newRel.id,
      details: `ربط علاقة شبكية جديدة (${relationshipType}) بدرجة ثقة ${newRel.confidenceScore}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, relationship: newRel }, { status: 201 });
  } catch (error) {
    console.error("Error creating relationship:", error);
    return NextResponse.json({ success: false, error: "فشل إنشاء العلاقة" }, { status: 500 });
  }
}
