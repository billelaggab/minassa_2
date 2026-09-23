"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Printer,
  Edit,
  Trash2,
  Phone,
  Mail,
  Share2,
  FileText,
  Paperclip,
  Network,
  Plus,
  Key,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  AlertOctagon,
  Calendar,
  MapPin,
  Briefcase,
  Flag,
  Fingerprint,
  ExternalLink,
} from "lucide-react";
import { PersonItem } from "./DossierCard";

export interface ContactChannel {
  id: string;
  personId: string;
  channelType: "phone" | "email" | "social" | string;
  value: string;
  label: string | null;
  hasWhatsapp: boolean | null;
  hasSignal: boolean | null;
  hasTelegram: boolean | null;
  carrierNotes: string | null;
  pgpPublicKey: string | null;
  profileUrl: string | null;
  createdAt: string;
}

export interface IntelligenceNote {
  id: string;
  personId: string;
  title: string;
  content: string;
  category: "meeting_log" | "financial_trail" | "background_check" | "source_leak" | "surveillance" | string;
  eventDate: string | null;
  recordingDate: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface AttachmentItem {
  id: string;
  personId: string;
  noteId: string | null;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  sha256Hash: string;
  contextDescription: string | null;
  fileData: string | null;
  isSensitive: boolean;
  createdAt: string;
}

export interface RelationshipItem {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: string;
  confidenceScore: string;
  contextNotes: string | null;
  isSource: boolean;
  createdAt?: string;
  otherPerson: {
    id: string;
    primaryName: string;
    avatarUrl: string | null;
    occupation: string | null;
    sensitivityLevel: string;
    status: string;
  } | null;
}

interface DossierDetailProps {
  person: PersonItem;
  contacts: ContactChannel[];
  notes: IntelligenceNote[];
  attachments: AttachmentItem[];
  relationships: RelationshipItem[];
  auditLogs?: any[];
  onBack: () => void;
  onOpenExport: (id: string) => void;
  onOpenEdit: () => void;
  onDeletePerson: () => void;
  onAddContact: () => void;
  onDeleteContact: (id: string) => void;
  onAddNote: () => void;
  onDeleteNote: (id: string) => void;
  onAddAttachment: () => void;
  onDeleteAttachment: (id: string) => void;
  onAddRelationship: () => void;
  onDeleteRelationship: (id: string) => void;
  onPreviewMedia: (attachment: AttachmentItem) => void;
}

export default function DossierDetail({
  person,
  contacts,
  notes,
  attachments,
  relationships,
  auditLogs = [],
  onBack,
  onOpenExport,
  onOpenEdit,
  onDeletePerson,
  onAddContact,
  onDeleteContact,
  onAddNote,
  onDeleteNote,
  onAddAttachment,
  onDeleteAttachment,
  onAddRelationship,
  onDeleteRelationship,
  onPreviewMedia,
}: DossierDetailProps) {
  // State for unmasking confidential notes individually or all
  const [unmaskedNotes, setUnmaskedNotes] = useState<Record<string, boolean>>({});
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "contacts" | "notes" | "evidence" | "network" | "audit">("all");

  const toggleUnmaskNote = (noteId: string) => {
    setUnmaskedNotes((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "meeting_log":
        return { label: "سجل اجتماع سري", bg: "bg-blue-950/80 text-blue-300 border-blue-800/60" };
      case "financial_trail":
        return { label: "أثر مالي وتدفقات", bg: "bg-amber-950/80 text-amber-300 border-amber-800/60" };
      case "background_check":
        return { label: "فحص خلفية وتحري", bg: "bg-purple-950/80 text-purple-300 border-purple-800/60" };
      case "source_leak":
        return { label: "تسريب مصادر / مبلّغ", bg: "bg-red-950/80 text-red-300 border-red-800/60" };
      case "surveillance":
        return { label: "رصد ميداني ومراقبة", bg: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60" };
      default:
        return { label: category, bg: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case "lawyer":
        return { label: "محامٍ ومستشار قانوني", color: "text-purple-400 bg-purple-950/60 border-purple-800/40" };
      case "business_partner":
        return { label: "شريك تجاري واستثماري", color: "text-blue-400 bg-blue-950/60 border-blue-800/40" };
      case "relative":
        return { label: "قريب / صلة عائلية", color: "text-cyan-400 bg-cyan-950/60 border-cyan-800/40" };
      case "accomplice":
        return { label: "متواطئ / منفذ ميداني", color: "text-red-400 bg-red-950/60 border-red-800/40" };
      case "adversary":
        return { label: "خصم / طرف مناوئ", color: "text-orange-400 bg-orange-950/60 border-orange-800/40" };
      case "whistleblower":
        return { label: "مبلّغ / شاهد تسريبات", color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40" };
      case "broker":
        return { label: "وسيط مالي / صفقات", color: "text-amber-400 bg-amber-950/60 border-amber-800/40" };
      default:
        return { label: type, color: "text-slate-400 bg-slate-900 border-slate-800" };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Back button & Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لدليل الملفات</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenExport(person.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-xs font-semibold border border-cyan-700/60 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>تصدير وطباعة الملف الاستقصائي</span>
          </button>

          <button
            onClick={onOpenEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <Edit className="w-3.5 h-3.5 text-amber-400" />
            <span>تعديل البيانات</span>
          </button>

          <button
            onClick={onDeletePerson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/50 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>حذف الملف</span>
          </button>
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <div className="relative bg-[#0d121f] border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        {/* Classified Watermark in Header */}
        <div className="absolute top-4 left-6 select-none opacity-20 pointer-events-none">
          <span className="text-3xl font-black font-mono tracking-widest text-red-500 uppercase">
            {person.sensitivityLevel === "top_secret" ? "TOP SECRET // سري للغاية" : "CONFIDENTIAL // سري"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          {/* Avatar / Photo */}
          <div className="shrink-0 text-center">
            {person.avatarUrl ? (
              <img
                src={person.avatarUrl}
                alt={person.primaryName}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-700 shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 text-3xl font-bold">
                {person.primaryName.substring(0, 2)}
              </div>
            )}
            <span className="inline-block mt-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              ID: {person.id.substring(0, 8)}
            </span>
          </div>

          {/* Dossier Meta Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-black text-slate-100">{person.primaryName}</h1>
              {person.sensitivityLevel === "top_secret" && (
                <span className="bg-red-950 text-red-300 border border-red-700 text-xs px-2.5 py-0.5 rounded-md font-bold font-mono">
                  سري للغاية // TOP SECRET
                </span>
              )}
              {person.sensitivityLevel === "confidential" && (
                <span className="bg-amber-950 text-amber-300 border border-amber-700 text-xs px-2.5 py-0.5 rounded-md font-bold font-mono">
                  سري // CONFIDENTIAL
                </span>
              )}
              {person.status === "source" && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs px-2.5 py-0.5 rounded-md font-bold">
                  مصدر استقصائي محمي
                </span>
              )}
            </div>

            {/* Aliases */}
            {person.aliasesList && person.aliasesList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-slate-400 font-mono">الأسماء الحركية / المستعارة:</span>
                {person.aliasesList.map((alias, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-500/10 text-amber-300 text-xs px-2.5 py-0.5 rounded border border-amber-500/30 font-medium"
                  >
                    "{alias}"
                  </span>
                ))}
              </div>
            )}

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs mb-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">المهنة / الغطاء:</span>
                  <span className="font-semibold">{person.occupation || "غير محدد"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Flag className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">الجنسية:</span>
                  <span className="font-semibold">{person.nationality || "غير محددة"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">تاريخ الميلاد:</span>
                  <span className="font-semibold">{person.dob || "غير مسجل"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 sm:col-span-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">العنوان الفعلي الحالي:</span>
                  <span className="font-semibold">{person.address || "غير محدد أو موقع متنقل"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[10px]">مستوى الموثوقية:</span>
                  <span className="font-bold text-amber-400">
                    {person.reliabilityRating} من 5 نجوم
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            {person.summary && (
              <div className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">ملخص التحقيق الاستقصائي:</span>
                {person.summary}
              </div>
            )}
          </div>
        </div>

        {/* Section Tabs inside Dossier */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 mt-6 pt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            عرض الملف بالكامل
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "contacts"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>قنوات الاتصال ({contacts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>تقارير الملاحظات ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>الأدلة الجنائية SHA-256 ({attachments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "network"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>شبكة العلاقات والصلات ({relationships.length})</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CONTACT CHANNELS */}
      {(activeTab === "all" || activeTab === "contacts") && (
        <section className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  قنوات الاتصال والاستهداف (Contact Channels)
                </h2>
                <p className="text-xs text-slate-400">
                  أرقام الهواتف المشفرة والمؤقتة (Burner)، صناديق البريد، وحسابات التواصل ومفاتيح PGP
                </p>
              </div>
            </div>

            <button
              onClick={onAddContact}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة وسيلة اتصال</span>
            </button>
          </div>

          {contacts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              لا توجد قنوات اتصال مسجلة لهذا الشخص بعد.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        {c.channelType === "phone" && <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                        {c.channelType === "email" && <Mail className="w-3.5 h-3.5 text-cyan-400" />}
                        {c.channelType === "social" && <Share2 className="w-3.5 h-3.5 text-purple-400" />}
                        <span>
                          {c.channelType === "phone" ? "هاتف" : c.channelType === "email" ? "بريد إلكتروني" : "حساب تواصل"}
                        </span>
                      </span>
                      {c.label && (
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-mono">
                          {c.label}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-mono font-bold text-slate-100 select-all mb-2 break-all">
                      {c.value}
                    </div>

                    {/* App Badges for phones */}
                    {c.channelType === "phone" && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {c.hasSignal && (
                          <span className="bg-blue-950/80 text-blue-300 text-[10px] px-1.5 py-0.2 rounded border border-blue-800/60 font-semibold">
                            Signal (مشفر)
                          </span>
                        )}
                        {c.hasWhatsapp && (
                          <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-800/60 font-semibold">
                            WhatsApp
                          </span>
                        )}
                        {c.hasTelegram && (
                          <span className="bg-cyan-950/80 text-cyan-300 text-[10px] px-1.5 py-0.2 rounded border border-cyan-800/60 font-semibold">
                            Telegram
                          </span>
                        )}
                      </div>
                    )}

                    {/* Carrier Notes */}
                    {c.carrierNotes && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/60 mb-2">
                        {c.carrierNotes}
                      </p>
                    )}

                    {/* PGP Public Key */}
                    {c.pgpPublicKey && (
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono mb-2">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Key className="w-3 h-3" />
                            مفتاح PGP عام
                          </span>
                          <button
                            onClick={() => copyToClipboard(c.pgpPublicKey!, c.id)}
                            className="hover:text-slate-200"
                            title="نسخ المفتاح"
                          >
                            {copiedHash === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="line-clamp-2 text-slate-500">{c.pgpPublicKey}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                    <button
                      onClick={() => onDeleteContact(c.id)}
                      className="text-slate-500 hover:text-red-400 text-[11px] transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: INTELLIGENCE & FIELD NOTES */}
      {(activeTab === "all" || activeTab === "notes") && (
        <section className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  الملاحظات الميدانية وتقارير الاستخبارات (Intelligence & Field Notes)
                </h2>
                <p className="text-xs text-slate-400">
                  محاضر الاجتماعات السرية، تتبع الآثار المالية، وتحريات المصادر الميدانية
                </p>
              </div>
            </div>

            <button
              onClick={onAddNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل ملاحظة جديدة</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              لا توجد تقارير أو ملاحظات ميدانية مسجلة لهذا الشخص بعد.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((n) => {
                const cat = getCategoryLabel(n.category);
                const isUnmasked = unmaskedNotes[n.id] || !n.isConfidential;

                return (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-all ${
                      n.isConfidential
                        ? "bg-slate-900/80 border-red-900/40 hover:border-red-800/60"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${cat.bg}`}>
                          {cat.label}
                        </span>
                        {n.isConfidential && (
                          <span className="flex items-center gap-1 text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">
                            <Lock className="w-2.5 h-2.5 text-red-400" />
                            سري للغاية (محمي)
                          </span>
                        )}
                        {n.eventDate && (
                          <span className="text-slate-400 text-xs font-mono">
                            تاريخ الواقعة: {n.eventDate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {n.isConfidential && (
                          <button
                            onClick={() => toggleUnmaskNote(n.id)}
                            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded border border-slate-700 transition"
                          >
                            {isUnmasked ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>حجب النص</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>فك حجب الملاحظة</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteNote(n.id)}
                          className="text-slate-500 hover:text-red-400 text-xs p-1"
                          title="حذف الملاحظة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-2">{n.title}</h4>

                    {/* Content text */}
                    {isUnmasked ? (
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 font-sans">
                        {n.content}
                      </p>
                    ) : (
                      <div className="bg-red-950/20 border border-dashed border-red-900/60 rounded-lg p-4 text-center">
                        <AlertOctagon className="w-6 h-6 text-red-400 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-red-300">
                          محتوى سري للغاية خاضع لبروتوكول حماية المصادر
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          تم تشفير النص وحجبه عن الشاشة لمنع استراق النظر. اضغط "فك حجب الملاحظة" للاطلاع.
                        </p>
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      تاريخ التسجيل في النظام: {new Date(n.recordingDate).toLocaleString("ar-EG")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: DOCUMENTS & CRYPTOGRAPHIC EVIDENCE */}
      {(activeTab === "all" || activeTab === "evidence") && (
        <section className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  الأدلة الجنائية وسلسلة الحيازة (Cryptographic Chain of Custody)
                </h2>
                <p className="text-xs text-slate-400">
                  الوثائق المسربة، العقود الأصلية، والتسجيلات الموثقة ببصمات SHA-256 لمنع التلاعب
                </p>
              </div>
            </div>

            <button
              onClick={onAddAttachment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إيداع حرز رقمي جديد</span>
            </button>
          </div>

          {attachments.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              لا توجد أحراز أو وثائق رقمية مودعة في سلسلة الحيازة لهذا الشخص.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-amber-400 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-200 truncate" title={file.originalFilename}>
                          {file.originalFilename}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>

                    {file.contextDescription && (
                      <p className="text-xs text-slate-300 mb-2.5 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                        {file.contextDescription}
                      </p>
                    )}

                    {/* SHA-256 Cryptographic Hash */}
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/90 text-slate-400 text-xs font-mono mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <Fingerprint className="w-3 h-3" />
                          بصمة التشفير الجنائي SHA-256:
                        </span>
                        <button
                          onClick={() => copyToClipboard(file.sha256Hash, file.id)}
                          className="hover:text-slate-200 text-[10px] flex items-center gap-1"
                          title="نسخ البصمة"
                        >
                          {copiedHash === file.id ? (
                            <span className="text-emerald-400 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> تم النسخ
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-slate-400">
                              <Copy className="w-3 h-3" /> نسخ
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 break-all select-all">{file.sha256Hash}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onPreviewMedia(file)}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الحرز في المتصفح</span>
                    </button>

                    <button
                      onClick={() => onDeleteAttachment(file.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SECTION 4: RELATIONSHIPS & NETWORK GRAPH */}
      {(activeTab === "all" || activeTab === "network") && (
        <section className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  شبكة العلاقات والصلات (Network Directory)
                </h2>
                <p className="text-xs text-slate-400">
                  الأشخاص والكيانات المرتبطة، المحامين، الشركاء، المتواطئين، والمصادر
                </p>
              </div>
            </div>

            <button
              onClick={onAddRelationship}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ربط علاقة جديدة</span>
            </button>
          </div>

          {relationships.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              لا توجد علاقات شبكية مسجلة لهذا الشخص بعد.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relationships.map((rel) => {
                const badge = getRelationshipLabel(rel.relationshipType);

                return (
                  <div
                    key={rel.id}
                    className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            rel.confidenceScore === "confirmed"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {rel.confidenceScore === "confirmed" ? "علاقة مؤكدة" : "علاقة مشتبهة"}
                        </span>
                      </div>

                      {rel.otherPerson ? (
                        <div className="flex items-center gap-3 my-2">
                          {rel.otherPerson.avatarUrl ? (
                            <img
                              src={rel.otherPerson.avatarUrl}
                              alt={rel.otherPerson.primaryName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                              {rel.otherPerson.primaryName.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-slate-100">
                              {rel.otherPerson.primaryName}
                            </h4>
                            <p className="text-xs text-slate-400">{rel.otherPerson.occupation || "بدون مهنة"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 my-2">طرف غير معرف</div>
                      )}

                      {rel.contextNotes && (
                        <p className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded border border-slate-800/60 my-2">
                          {rel.contextNotes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(rel.createdAt || Date.now()).toLocaleDateString("ar-EG")}
                      </span>
                      <button
                        onClick={() => onDeleteRelationship(rel.id)}
                        className="text-slate-500 hover:text-red-400 text-xs transition"
                      >
                        فك الارتباط
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
