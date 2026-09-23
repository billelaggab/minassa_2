import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactChannels, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ contactId: string }> }
) {
  try {
    const { contactId } = await props.params;

    const [existing] = await db
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.id, contactId));

    if (!existing) {
      return NextResponse.json({ success: false, error: "القناة غير موجودة" }, { status: 404 });
    }

    await db.delete(contactChannels).where(eq(contactChannels.id, contactId));

    await db.insert(auditLogs).values({
      action: "CONTACT_DELETED",
      entityType: "contact",
      entityId: contactId,
      details: `حذف قناة الاتصال: ${existing.value}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "تم حذف قناة الاتصال" });
  } catch (error) {
    console.error("Error deleting contact channel:", error);
    return NextResponse.json({ success: false, error: "فشل حذف قناة الاتصال" }, { status: 500 });
  }
}
