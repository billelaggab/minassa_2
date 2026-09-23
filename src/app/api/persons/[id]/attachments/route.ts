import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attachments, auditLogs, persons } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    const [person] = await db.select().from(persons).where(eq(persons.id, id));
    if (!person) {
      return NextResponse.json({ success: false, error: "الشخص غير موجود" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";

    let originalFilename = "evidence_file";
    let mimeType = "application/octet-stream";
    let fileSize = 0;
    let sha256Hash = "";
    let fileData = "";
    let contextDescription = "";
    let noteId: string | null = null;
    let isSensitive = false;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      originalFilename = body.filename || "evidence_document.dat";
      mimeType = body.mimeType || "application/octet-stream";
      fileData = body.fileData || "";
      contextDescription = body.contextDescription || "";
      noteId = body.noteId || null;
      isSensitive = Boolean(body.isSensitive);

      // Clean filename against path traversal
      originalFilename = originalFilename.replace(/[\/\\]/g, "_").trim();

      // Compute SHA-256 hash
      const buffer = Buffer.from(fileData.replace(/^data:.*?;base64,/, ""), "base64");
      fileSize = buffer.length > 0 ? buffer.length : fileData.length;
      sha256Hash = crypto.createHash("sha256").update(buffer.length > 0 ? buffer : fileData).digest("hex");
    } else {
      // Multipart form data
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      contextDescription = (formData.get("contextDescription") as string) || "";
      noteId = (formData.get("noteId") as string) || null;
      isSensitive = formData.get("isSensitive") === "true";

      if (!file) {
        return NextResponse.json({ success: false, error: "الملف مطلوب" }, { status: 400 });
      }

      // Sanitize against directory traversal
      originalFilename = file.name.replace(/[\/\\]/g, "_").trim();
      mimeType = file.type || "application/octet-stream";
      fileSize = file.size;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

      const base64 = buffer.toString("base64");
      fileData = `data:${mimeType};base64,${base64}`;
    }

    const storedFilename = `custody_${crypto.randomUUID()}_${originalFilename.replace(/[^a-zA-Z0-9_\u0600-\u06FF\.\-]/g, "_")}`;

    const [newAttachment] = await db
      .insert(attachments)
      .values({
        personId: id,
        noteId,
        originalFilename,
        storedFilename,
        mimeType,
        fileSize,
        sha256Hash,
        contextDescription: contextDescription.trim() || null,
        fileData,
        isSensitive,
      })
      .returning();

    await db.insert(auditLogs).values({
      action: "EVIDENCE_CHAIN_RECORDED",
      entityType: "attachment",
      entityId: newAttachment.id,
      details: `إيداع حرز رقمي: "${originalFilename}" (SHA-256: ${sha256Hash.substring(0, 16)}...) في ملف: ${person.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, attachment: newAttachment }, { status: 201 });
  } catch (error) {
    console.error("Error storing attachment:", error);
    return NextResponse.json({ success: false, error: "فشل حفظ المرفق الرقمي" }, { status: 500 });
  }
}
