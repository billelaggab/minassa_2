import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactChannels, auditLogs, persons } from "@/db/schema";
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

    const {
      channelType,
      value,
      label,
      hasWhatsapp,
      hasSignal,
      hasTelegram,
      carrierNotes,
      pgpPublicKey,
      profileUrl,
    } = body;

    if (!channelType || !value) {
      return NextResponse.json({ success: false, error: "نوع القناة والقيمة مطلوبان" }, { status: 400 });
    }

    const [newContact] = await db
      .insert(contactChannels)
      .values({
        personId: id,
        channelType,
        value: value.trim(),
        label: label?.trim() || null,
        hasWhatsapp: Boolean(hasWhatsapp),
        hasSignal: Boolean(hasSignal),
        hasTelegram: Boolean(hasTelegram),
        carrierNotes: carrierNotes?.trim() || null,
        pgpPublicKey: pgpPublicKey?.trim() || null,
        profileUrl: profileUrl?.trim() || null,
      })
      .returning();

    await db.insert(auditLogs).values({
      action: "CONTACT_ADDED",
      entityType: "contact",
      entityId: newContact.id,
      details: `إضافة قناة اتصال (${channelType}: ${value}) للملف: ${person.primaryName}`,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact channel:", error);
    return NextResponse.json({ success: false, error: "فشل إضافة قناة الاتصال" }, { status: 500 });
  }
}
