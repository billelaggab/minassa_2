import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attachments, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await props.params;

    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, fileId));

    if (!attachment) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    await db.insert(auditLogs).values({
      action: "EVIDENCE_ACCESSED",
      entityType: "attachment",
      entityId: fileId,
      details: `استعراض/تنزيل الحرز الرقمي: ${attachment.originalFilename} (SHA-256: ${attachment.sha256Hash})`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      attachment,
    });
  } catch (error) {
    console.error("Error accessing attachment:", error);
    return NextResponse.json({ success: false, error: "فشل استرجاع الملف" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await props.params;

    const [existing] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, fileId));

    if (!existing) {
      return NextResponse.json({ success: false, error: "الملف غير موجود" }, { status: 404 });
    }

    await db.delete(attachments).where(eq(attachments.id, fileId));

    await db.insert(auditLogs).values({
      action: "EVIDENCE_DESTROYED",
      entityType: "attachment",
      entityId: fileId,
      details: `إتلاف/حذف الحرز الرقمي: ${existing.originalFilename} (Hash: ${existing.sha256Hash})`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "تم حذف الحرز الرقمي بنجاح" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({ success: false, error: "فشل حذف الملف" }, { status: 500 });
  }
}
