"use client";

import React from "react";
import {
  ShieldAlert,
  Star,
  Phone,
  FileText,
  Paperclip,
  Network,
  Printer,
  ChevronLeft,
  Lock,
  Eye,
  AlertTriangle,
} from "lucide-react";

export interface PersonItem {
  id: string;
  primaryName: string;
  aliases: string | null;
  aliasesList: string[];
  avatarUrl: string | null;
  dob: string | null;
  nationality: string | null;
  occupation: string | null;
  address: string | null;
  reliabilityRating: number;
  sensitivityLevel: "public" | "confidential" | "top_secret" | string;
  status: "under_investigation" | "monitored" | "source" | "witness" | "archived" | string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  counts?: {
    contacts: number;
    notes: number;
    files: number;
    relations: number;
  };
}

interface DossierCardProps {
  person: PersonItem;
  onOpenDetail: (id: string) => void;
  onOpenExport: (id: string) => void;
}

export default function DossierCard({
  person,
  onOpenDetail,
  onOpenExport,
}: DossierCardProps) {
  const getSensitivityBadge = (level: string) => {
    switch (level) {
      case "top_secret":
        return (
          <span className="inline-flex items-center gap-1 bg-red-950/80 text-red-300 border border-red-700/60 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
            <Lock className="w-3 h-3 text-red-400" />
            سري للغاية
          </span>
        );
      case "confidential":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            سري
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">
            معلومات عامة
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under_investigation":
        return (
          <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
            قيد التحقيق النشط
          </span>
        );
      case "monitored":
        return (
          <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
            تحت المراقبة والرصد
          </span>
        );
      case "source":
        return (
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
            مصدر سري / مبلّغ
          </span>
        );
      case "witness":
        return (
          <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[11px] font-medium">
            شاهد متعاون
          </span>
        );
      default:
        return (
          <span className="bg-slate-700/40 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[11px]">
            ملف مؤرشف
          </span>
        );
    }
  };

  return (
    <div className="relative bg-[#0d121f] hover:bg-[#111728] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group overflow-hidden">
      {/* Top watermark background effect */}
      <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-800 select-none uppercase tracking-widest pointer-events-none">
        DOSSIER ID: {person.id.substring(0, 8)}
      </div>

      <div>
        {/* Header: Photo + Name + Badges */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative shrink-0">
            {person.avatarUrl ? (
              <img
                src={person.avatarUrl}
                alt={person.primaryName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-lg font-bold">
                {person.primaryName.substring(0, 2)}
              </div>
            )}
            {person.status === "source" && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="مصدر محمي" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                {person.primaryName}
              </h3>
            </div>

            <p className="text-xs text-amber-400/90 font-medium truncate mb-1">
              {person.occupation || "بدون مهنة محددة"}
            </p>

            <div className="flex items-center gap-2">
              {getSensitivityBadge(person.sensitivityLevel)}
              {getStatusBadge(person.status)}
            </div>
          </div>
        </div>

        {/* Aliases Pills */}
        {person.aliasesList && person.aliasesList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[11px] text-slate-500 font-mono">الأسماء الحركية:</span>
            {person.aliasesList.slice(0, 3).map((alias, idx) => (
              <span
                key={idx}
                className="bg-slate-800/80 text-slate-300 text-[11px] px-2 py-0.5 rounded border border-slate-700/70"
              >
                "{alias}"
              </span>
            ))}
            {person.aliasesList.length > 3 && (
              <span className="text-[10px] text-slate-500 self-center">
                +{person.aliasesList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Reliability Rating & Summary */}
        <div className="mb-3.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 text-[11px]">مستوى الموثوقية الاستخباراتية:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= person.reliabilityRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {person.summary || "لا يوجد ملخص استقصائي مسجل بعد لهذا الهدف."}
          </p>
        </div>

        {/* Counts summary row */}
        {person.counts && (
          <div className="grid grid-cols-4 gap-1.5 py-2 border-t border-b border-slate-800/70 text-center text-xs">
            <div className="bg-slate-900/40 p-1 rounded">
              <span className="block text-slate-400 text-[10px]">جهات الاتصال</span>
              <span className="font-bold text-emerald-400">{person.counts.contacts}</span>
            </div>
            <div className="bg-slate-900/40 p-1 rounded">
              <span className="block text-slate-400 text-[10px]">ملاحظات</span>
              <span className="font-bold text-purple-400">{person.counts.notes}</span>
            </div>
            <div className="bg-slate-900/40 p-1 rounded">
              <span className="block text-slate-400 text-[10px]">أدلة جنائية</span>
              <span className="font-bold text-amber-400">{person.counts.files}</span>
            </div>
            <div className="bg-slate-900/40 p-1 rounded">
              <span className="block text-slate-400 text-[10px]">صلات وعلاقات</span>
              <span className="font-bold text-cyan-400">{person.counts.relations}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(person.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-amber-500/50 transition shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>فتح الملف الكامل</span>
        </button>

        <button
          onClick={() => onOpenExport(person.id)}
          className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 transition"
          title="تصدير وطباعة الملف الاستقصائي"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>طباعة التقرير</span>
        </button>
      </div>
    </div>
  );
}
