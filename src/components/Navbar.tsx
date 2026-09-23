"use client";

import React from "react";
import {
  ShieldAlert,
  Search,
  PlusCircle,
  Network,
  Users,
  FileText,
  Lock,
  History,
  HardDriveDownload,
} from "lucide-react";

interface NavbarProps {
  activeTab: "persons" | "network" | "search" | "audit";
  setActiveTab: (tab: "persons" | "network" | "search" | "audit") => void;
  onOpenNewPerson: () => void;
  onOpenSearch: () => void;
  onOpenAudit: () => void;
  stats: {
    totalPersons: number;
    topSecretPersons: number;
    activeSources: number;
    totalNotes: number;
    totalAttachments: number;
    totalRelationships: number;
  } | null;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewPerson,
  onOpenSearch,
  onOpenAudit,
  stats,
}: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-[#090d18]/90 backdrop-blur-md sticky top-0 z-30 no-print">
      {/* Top Security Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-red-950/40 border-b border-red-900/30 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-red-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider">
            نظام استقصائي محلي مُغلق (معزول تماماً عن الإنترنت) // AIR-GAPPED OFFLINE SYSTEM
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden sm:inline">بروتوكول تشفير الأدلة: SHA-256</span>
          <span className="text-amber-400 font-bold">درجة الحماية: سري للغاية</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 via-red-600 to-slate-900 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-100">
                منظومة الاستقصاء وإدارة المعلومات
              </span>
              <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-700/50 px-1.5 py-0.5 rounded font-mono">
                v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400">
              إدارة جهات الاتصال، شبكات النفوذ، وسلسلة الحيازة الجنائية
            </p>
          </div>
        </div>

        {/* Global Instant Search Button */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-amber-500/50 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-sm transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>البحث الشامل (بالتطبيع اللغوي العربي)...</span>
            </div>
            <kbd className="hidden lg:inline-block bg-slate-800 border border-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded font-mono">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="البحث"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 transition"
            title="سجل العمليات والتدقيق الجنائي"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">سجل التدقيق</span>
          </button>

          <button
            onClick={onOpenNewPerson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-950/40 border border-amber-400/40 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ملف استقصائي جديد</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between border-t border-slate-800/60 overflow-x-auto text-sm">
        <nav className="flex space-x-reverse space-x-1 sm:space-x-2 py-2">
          <button
            onClick={() => setActiveTab("persons")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition ${
              activeTab === "persons"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>دليل الملفات والأشخاص</span>
            {stats && (
              <span className="bg-slate-800 text-slate-300 text-xs px-1.5 py-0.2 rounded font-mono">
                {stats.totalPersons}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("network")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition ${
              activeTab === "network"
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Network className="w-4 h-4" />
            <span>شبكة العلاقات والصلات</span>
            {stats && (
              <span className="bg-slate-800 text-slate-300 text-xs px-1.5 py-0.2 rounded font-mono">
                {stats.totalRelationships}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition ${
              activeTab === "search"
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>محرك البحث والتحليل</span>
          </button>
        </nav>

        {stats && (
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-red-400">
              <Lock className="w-3.5 h-3.5" />
              <span>{stats.topSecretPersons} شديد السرية</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400">
              {stats.activeSources} مصادر ومبلّغين
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-amber-400">
              {stats.totalAttachments} أحراز وأدلة رقمية
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
