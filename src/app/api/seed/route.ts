import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "تمت تهيئة قاعدة البيانات الاستقصائية بنجاح" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: "فشل تهيئة البيانات" }, { status: 500 });
  }
}
