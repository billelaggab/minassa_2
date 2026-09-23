"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Shield,
  ShieldAlert,
  Lock,
  Download,
  Filter,
  Check,
  Eye,
  Calendar,
  Fingerprint,
  Phone,
  Mail,
  Network,
  AlertTriangle,
} from "lucide-react";

interface DossierExportModalProps {
  personId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DossierExportModal({
  personId,
  isOpen,
  onClose,
}: DossierExportModalProps) {
  const [excludeConfidential, setExcludeConfidential] = useState(false);
  const [excludeMedia, setExcludeMedia] = useState(false);
  const [redactSources, setRedactSources] = useState(false);
  const [customWatermark, setCustomWatermark] = useState("سري للغاية - ملف استقصائي جنائي محمي // TOP SECRET");
  const [dossierData, setDossierData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !personId) return;

    fetchExportData();
  }, [isOpen, personId, excludeConfidential, excludeMedia, redactSources, customWatermark]);

  const fetchExportData = async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dossier/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          excludeConfidential,
          excludeMedia,
          redactSources,
          customWatermark,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDossierData(data.dossier);
      }
    } catch (err) {
      console.error("Export fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-5xl bg-[#0c101c] border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 border-b border-slate-800 bg-[#090d18] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                محرك إعداد وتصدير الملف الاستقصائي (Dossier Print & PDF Engine)
              </h3>
              <p className="text-[11px] text-slate-400">
                توليد تقرير رسمي مصنف بضوابط الرقابة والتنقيح الأمني
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-red-950/40 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة فورية / حفظ كـ PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sanitization Filter Settings Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900/90 border-b border-slate-800 p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-amber-400">
            <Filter className="w-3.5 h-3.5" />
            <span>خيارات التنقيح والحماية الأمنية:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={excludeConfidential}
                onChange={(e) => setExcludeConfidential(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-800"
              />
              <span>استثناء المعلومات شديدة السرية</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={excludeMedia}
                onChange={(e) => setExcludeMedia(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-800"
              />
              <span>استثناء المرفقات والصور</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={redactSources}
                onChange={(e) => setRedactSources(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-800"
              />
              <span>حجب معرّفات المصادر والمبلّغين</span>
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">العلامة المائية:</span>
            <input
              type="text"
              value={customWatermark}
              onChange={(e) => setCustomWatermark(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-[11px] px-2 py-1 rounded w-48 font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#090d18] text-slate-100 dossier-print-container relative font-sans">
          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs">جاري تجهيز وتنسيق ملف التحقيق الاستقصائي...</p>
            </div>
          ) : !dossierData ? (
            <div className="py-24 text-center text-slate-500">فشل تحميل بيانات الملف</div>
          ) : (
            <div className="max-w-4xl mx-auto bg-[#0d121f] print:bg-white print:text-black border print:border-none border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
              {/* Dynamic Watermark on Document */}
              <div className="classified-watermark-overlay print-watermark font-mono">
                {customWatermark}
              </div>

              {/* Document Header Classification Banner */}
              <div className="border-b-2 border-red-700/80 pb-4 mb-6">
                <div className="flex items-center justify-between text-xs font-mono text-red-500 mb-2">
                  <span className="font-bold tracking-widest uppercase">
                    CLASSIFIED INVESTIGATIVE FILE // ملف استقصائي محمي
                  </span>
                  <span>رقم الملف: DOS-{dossierData.person.id.substring(0, 8).toUpperCase()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-slate-100 print:text-black">
                      تقرير التحقيق الاستقصائي الشامل
                    </h1>
                    <p className="text-xs text-slate-400 print:text-gray-700">
                      وحدة التحقيقات الاستقصائية المستقلة • تاريخ الإصدار:{" "}
                      {new Date(dossierData.exportDate).toLocaleString("ar-EG")}
                    </p>
                  </div>

                  <div className="border-2 border-red-600 px-3 py-1 text-center font-mono font-bold text-red-500 uppercase rotate-2 text-xs">
                    {dossierData.person.sensitivityLevel === "top_secret"
                      ? "سري للغاية"
                      : "سري ومحمي"}
                  </div>
                </div>
              </div>

              {/* Subject Core Dossier Section */}
              <div className="print-break-inside-avoid mb-6 bg-slate-950/40 print:bg-gray-50 p-4 rounded-xl border border-slate-800 print:border-gray-300">
                <div className="flex items-start gap-5">
                  {dossierData.person.avatarUrl && !excludeMedia ? (
                    <img
                      src={dossierData.person.avatarUrl}
                      alt={dossierData.person.primaryName}
                      className="w-24 h-24 rounded-xl object-cover border border-slate-700 print:border-gray-400 shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-800 print:bg-gray-200 border border-slate-700 flex items-center justify-center font-bold text-2xl text-slate-300 print:text-black shrink-0">
                      {dossierData.person.primaryName.substring(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-black text-slate-100 print:text-black mb-1">
                      {dossierData.person.primaryName}
                    </h2>
                    <p className="text-xs text-amber-400 print:text-gray-800 font-semibold mb-2">
                      {dossierData.person.occupation || "بدون غطاء محدد"}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300 print:text-gray-800 mb-2">
                      <div>
                        <span className="text-slate-500 block text-[10px]">الجنسية:</span>
                        <span className="font-semibold">{dossierData.person.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">تاريخ الميلاد:</span>
                        <span className="font-semibold">{dossierData.person.dob || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">مستوى الموثوقية:</span>
                        <span className="font-bold text-amber-400 print:text-black">
                          {dossierData.person.reliabilityRating} / 5 نجوم
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-slate-500 block text-[10px]">العنوان الفعلي:</span>
                        <span className="font-semibold">{dossierData.person.address || "غير مسجل"}</span>
                      </div>
                    </div>

                    {dossierData.person.aliasesList?.length > 0 && (
                      <div className="text-xs text-slate-400 print:text-gray-700">
                        <span className="font-semibold text-slate-300 print:text-black">
                          الأسماء الحركية:{" "}
                        </span>
                        {dossierData.person.aliasesList.join("، ")}
                      </div>
                    )}
                  </div>
                </div>

                {dossierData.person.summary && (
                  <div className="mt-4 pt-3 border-t border-slate-800 print:border-gray-300 text-xs text-slate-300 print:text-gray-900 leading-relaxed">
                    <span className="font-bold block text-slate-400 print:text-gray-700 mb-1">
                      ملخص التحقيق:
                    </span>
                    {dossierData.person.summary}
                  </div>
                )}
              </div>

              {/* Section 1: Contact Channels */}
              <div className="print-break-inside-avoid mb-6">
                <h3 className="text-sm font-bold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1.5 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>أولاً: قنوات الاتصال وبيانات الوصول</span>
                </h3>

                {dossierData.contacts.length === 0 ? (
                  <p className="text-xs text-slate-500 print:text-gray-600">لا توجد قنوات مسجلة.</p>
                ) : (
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 font-bold">
                        <th className="py-1.5">النوع</th>
                        <th className="py-1.5">القيمة / المعرف</th>
                        <th className="py-1.5">التصنيف</th>
                        <th className="py-1.5">ملاحظات التشفير والمزود</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                      {dossierData.contacts.map((c: any) => (
                        <tr key={c.id} className="text-slate-300 print:text-black">
                          <td className="py-2 font-semibold">
                            {c.channelType === "phone"
                              ? "هاتف"
                              : c.channelType === "email"
                              ? "بريد إلكتروني"
                              : "حساب اجتماعي"}
                          </td>
                          <td className="py-2 font-mono">{c.value}</td>
                          <td className="py-2">{c.label || "—"}</td>
                          <td className="py-2 text-[11px] text-slate-400 print:text-gray-600">
                            {c.carrierNotes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Section 2: Chronological Intelligence Log */}
              <div className="print-break-inside-avoid mb-6">
                <h3 className="text-sm font-bold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1.5 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span>ثانياً: سجل الوقائع والملاحظات الاستخباراتية (تسلسل زمني)</span>
                </h3>

                {dossierData.notes.length === 0 ? (
                  <p className="text-xs text-slate-500 print:text-gray-600">
                    لا توجد ملاحظات أو تم استثناؤها بموجب خيارات التنقيح.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dossierData.notes.map((n: any, idx: number) => (
                      <div
                        key={n.id}
                        className="print-break-inside-avoid p-3 rounded-lg bg-slate-950/40 print:bg-gray-50 border border-slate-800 print:border-gray-300 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-slate-100 print:text-black">
                            {idx + 1}. {n.title}
                          </span>
                          <span className="text-slate-400 print:text-gray-600 font-mono text-[11px]">
                            {n.eventDate || "غير محدد"}
                          </span>
                        </div>
                        <p className="text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed">
                          {n.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Relationship Directory */}
              <div className="print-break-inside-avoid mb-6">
                <h3 className="text-sm font-bold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1.5 mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-500" />
                  <span>ثالثاً: دليل شبكة العلاقات والصلات</span>
                </h3>

                {dossierData.relationships.length === 0 ? (
                  <p className="text-xs text-slate-500 print:text-gray-600">لا توجد صلات مسجلة.</p>
                ) : (
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 font-bold">
                        <th className="py-1.5">الطرف المرتبط</th>
                        <th className="py-1.5">نوع العلاقة</th>
                        <th className="py-1.5">درجة التأكيد</th>
                        <th className="py-1.5">سياق الصلة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                      {dossierData.relationships.map((r: any) => (
                        <tr key={r.id} className="text-slate-300 print:text-black">
                          <td className="py-2 font-bold">{r.targetName}</td>
                          <td className="py-2">{r.relationshipType}</td>
                          <td className="py-2">{r.confidenceScore === "confirmed" ? "مؤكدة" : "مشتبهة"}</td>
                          <td className="py-2 text-[11px] text-slate-400 print:text-gray-600">
                            {r.contextNotes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Section 4: Evidence & Cryptographic Chain of Custody */}
              {!excludeMedia && (
                <div className="print-break-inside-avoid mb-6">
                  <h3 className="text-sm font-bold text-slate-200 print:text-black border-b border-slate-800 print:border-gray-300 pb-1.5 mb-3 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-red-500" />
                    <span>رابعاً: فهرس الأدلة الجنائية وسلسلة الحيازة الرقمية</span>
                  </h3>

                  {dossierData.attachments.length === 0 ? (
                    <p className="text-xs text-slate-500 print:text-gray-600">
                      لا توجد أدلة مرفقة أو تم استثناؤها.
                    </p>
                  ) : (
                    <table className="w-full text-xs text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600 font-bold">
                          <th className="py-1.5">اسم الوثيقة</th>
                          <th className="py-1.5">النوع / الحجم</th>
                          <th className="py-1.5">بصمة SHA-256 الجنائية</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                        {dossierData.attachments.map((f: any) => (
                          <tr key={f.id} className="text-slate-300 print:text-black">
                            <td className="py-2 font-semibold">{f.originalFilename}</td>
                            <td className="py-2 font-mono text-[11px]">{f.mimeType}</td>
                            <td className="py-2 font-mono text-[10px] break-all select-all">
                              {f.sha256Hash}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Forensic Footer & Signature Block */}
              <div className="print-break-inside-avoid pt-6 mt-8 border-t-2 border-slate-800 print:border-black flex items-center justify-between text-xs text-slate-400 print:text-black">
                <div>
                  <p className="font-bold">المحقق المسؤول عن استخراج الملف:</p>
                  <p className="font-mono text-[11px]">محطة عمل محلية آمنة // AIR-GAPPED UNIT #01</p>
                </div>
                <div className="border border-dashed border-slate-700 print:border-black px-6 py-3 rounded text-center">
                  <p className="text-[10px] uppercase font-mono">ختم التوثيق والاعتماد الجنائي</p>
                  <p className="font-black font-mono text-red-500 print:text-red-700 mt-1">VERIFIED EVIDENCE</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
