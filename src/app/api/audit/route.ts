import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Audit fetch error:", error);
    return NextResponse.json({ success: false, error: "فشل استرجاع سجل التدقيق" }, { status: 500 });
  }
}
