import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { relationships, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const [existing] = await db.select().from(relationships).where(eq(relationships.id, id));
    if (!existing) {
      return NextResponse.json({ success: false, error: "العلاقة غير موجودة" }, { status: 404 });
    }

    await db.delete(relationships).where(eq(relationships.id, id));

    await db.insert(auditLogs).values({
      action: "RELATIONSHIP_UNLINKED",
      entityType: "relationship",
      entityId: id,
      details: `فك ارتباط العلاقة بين (${existing.sourcePersonId}) و (${existing.targetPersonId})`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "تم فك الارتباط بنجاح" });
  } catch (error) {
    console.error("Error deleting relationship:", error);
    return NextResponse.json({ success: false, error: "فشل حذف العلاقة" }, { status: 500 });
  }
}
