"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  X,
  FileText,
  Phone,
  Mail,
  Shield,
  Fingerprint,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { RankedSearchResult } from "@/app/api/search/route";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson: (personId: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectPerson,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RankedSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [normalizedQuery, setNormalizedQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setNormalizedQuery("");
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
          setNormalizedQuery(data.normalizedQuery || "");
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getMatchIcon = (field: string) => {
    switch (field) {
      case "primaryName":
      case "alias":
        return <User className="w-3.5 h-3.5 text-amber-400" />;
      case "phone":
        return <Phone className="w-3.5 h-3.5 text-emerald-400" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-cyan-400" />;
      case "noteTitle":
      case "noteContent":
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case "sha256Hash":
      case "filename":
      case "fileDescription":
        return <Fingerprint className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0e1422] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/60">
          <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الاسم الحركي، الهاتف، البريد، نص الملاحظات، أو بصمة SHA-256..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2.5 py-1 rounded border border-slate-700"
          >
            إغلاق Esc
          </button>
        </div>

        {/* Arabic Normalization Feature Explanation */}
        {query.trim().length > 0 && (
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                تطبيع الحروف العربية: تم توحيد (أ/إ/آ &rarr; ا)، (ة &rarr; ه)، (ي/ى &rarr; ي)، وإهمال التشكيل
              </span>
            </div>
            {normalizedQuery && (
              <span className="font-mono text-slate-500 text-[11px]">
                الصيغة المعيارية: {normalizedQuery}
              </span>
            )}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">جاري المسح الفوري في السجلات وقواعد البيانات الاستخباراتية...</p>
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Shield className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                لم يتم العثور على أي تطابق للبحث: "{query}"
              </p>
              <p className="text-xs text-slate-500 mt-1">
                جرب البحث بجزء من الاسم أو رقم الهاتف بدون فواصل أو كود الدولة
              </p>
            </div>
          ) : !query.trim() ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-400 mb-2">
                بحث استقصائي ذكي وفوري متوافق مع خوارزميات Meilisearch
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto mt-3">
                <button
                  onClick={() => setQuery("طارق")}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded text-xs border border-slate-700"
                >
                  الهدف: طارق المنصوري
                </button>
                <button
                  onClick={() => setQuery("محام")}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded text-xs border border-slate-700"
                >
                  المهنة: محامية دولية
                </button>
                <button
                  onClick={() => setQuery("فيينا")}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded text-xs border border-slate-700"
                >
                  تقرير: لقاء فيينا السري
                </button>
                <button
                  onClick={() => setQuery("proton")}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded text-xs border border-slate-700"
                >
                  قناة مشفرة: ProtonMail
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>نتائج البحث المصنفة حسب الأهمية ({results.length} هدف)</span>
                <span>مرتبة تنازلياً حسب درجة التطابق الجنائي</span>
              </div>

              {results.map((item) => (
                <div
                  key={item.personId}
                  onClick={() => {
                    onSelectPerson(item.personId);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.primaryName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                          {item.primaryName.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {item.primaryName}
                          </h4>
                          {item.sensitivityLevel === "top_secret" && (
                            <span className="bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] px-1.5 py-0.2 rounded font-mono">
                              سري للغاية
                            </span>
                          )}
                          {item.sensitivityLevel === "confidential" && (
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] px-1.5 py-0.2 rounded font-mono">
                              سري
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.occupation || "بدون غطاء وظيفي محدد"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                        تطابق: {Math.round(item.totalScore)}%
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Highlighted match snippets */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 space-y-1.5">
                    {item.matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/40"
                      >
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0 mt-0.5">
                          {getMatchIcon(m.field)}
                          <span>{m.fieldLabel}:</span>
                        </span>
                        <span className="text-slate-300 font-mono text-[11px] break-all">
                          {m.snippet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>المحرك: Meilisearch Native Arabic Normalization Engine</span>
          <span>اضغط على أي ملف لفتحه مباشرة</span>
        </div>
      </div>
    </div>
  );
}
