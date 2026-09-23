import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { intelligenceNotes, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await props.params;
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(intelligenceNotes)
      .where(eq(intelligenceNotes.id, noteId));

    if (!existing) {
      return NextResponse.json({ success: false, error: "الملاحظة غير موجودة" }, { status: 404 });
    }

    const { title, content, category, eventDate, isConfidential } = body;

    const [updated] = await db
      .update(intelligenceNotes)
      .set({
        title: title?.trim() ?? existing.title,
        content: content?.trim() ?? existing.content,
        category: category ?? existing.category,
        eventDate: eventDate !== undefined ? eventDate?.trim() || null : existing.eventDate,
        isConfidential: isConfidential !== undefined ? Boolean(isConfidential) : existing.isConfidential,
      })
      .where(eq(intelligenceNotes.id, noteId))
      .returning();

    await db.insert(auditLogs).values({
      action: "NOTE_UPDATED",
      entityType: "note",
      entityId: noteId,
      details: `تحديث الملاحظة الاستخباراتية: ${updated.title}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ success: false, error: "فشل تحديث الملاحظة" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await props.params;

    const [existing] = await db
      .select()
      .from(intelligenceNotes)
      .where(eq(intelligenceNotes.id, noteId));

    if (!existing) {
      return NextResponse.json({ success: false, error: "الملاحظة غير موجودة" }, { status: 404 });
    }

    await db.delete(intelligenceNotes).where(eq(intelligenceNotes.id, noteId));

    await db.insert(auditLogs).values({
      action: "NOTE_DELETED",
      entityType: "note",
      entityId: noteId,
      details: `حذف الملاحظة الاستخباراتية: ${existing.title}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "تم حذف الملاحظة بنجاح" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ success: false, error: "فشل حذف الملاحظة" }, { status: 500 });
  }
}
