import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "منظومة الاستقصاء الاستخباراتي | Investigative Intelligence Management",
  description:
    "منظومة محلية آمنة ومغلقة لإدارة جهات الاتصال، شبكات العلاقات، وتوثيق الأدلة الجنائية للصحفيين الاستقصائيين",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 antialiased">
        {children}
      </body>
    </html>
  );
}
