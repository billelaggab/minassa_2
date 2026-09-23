import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intelligenceNotes, auditLogs, persons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    const [person] = await db.select().from(persons).where(eq(persons.id, id));
    if (!person) {
      return NextResponse.json({ success: false, error: "الشخص غير موجود" }, { status: 404 });
    }

    const { title, content, category, eventDate, isConfidential } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ success: false, error: "العنوان والمحتوى والتصنيف حقول مطلوبة" }, { status: 400 });
    }

    const [newNote] = await db
      .insert(intelligenceNotes)
      .values({
        personId: id,
        title: title.trim(),
        content: content.trim(),
        category,
        eventDate: eventDate?.trim() || null,
        isConfidential: Boolean(isConfidential),
      })
      .returning();

    await db.insert(auditLogs).values({
      action: "NOTE_RECORDED",
      entityType: "note",
      entityId: newNote.id,
      details: `تسجيل ملاحظة استخباراتية جديدة: "${newNote.title}" للملف: ${person.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ success: false, error: "فشل حفظ الملاحظة الاستخباراتية" }, { status: 500 });
  }
}
