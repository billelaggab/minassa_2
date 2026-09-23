"use client";

import React, { useState } from "react";
import { X, Network, Link, AlertTriangle } from "lucide-react";
import { PersonItem } from "./DossierCard";

interface NewRelationshipModalProps {
  currentPersonId?: string;
  allPersons: PersonItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function NewRelationshipModal({
  currentPersonId,
  allPersons,
  isOpen,
  onClose,
  onSaved,
}: NewRelationshipModalProps) {
  const [sourcePersonId, setSourcePersonId] = useState(currentPersonId || allPersons[0]?.id || "");
  const [targetPersonId, setTargetPersonId] = useState(
    allPersons.find((p) => p.id !== (currentPersonId || allPersons[0]?.id))?.id || ""
  );
  const [relationshipType, setRelationshipType] = useState("business_partner");
  const [confidenceScore, setConfidenceScore] = useState("confirmed");
  const [contextNotes, setContextNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePersonId || !targetPersonId) {
      setError("يرجى تحديد كلا الطرفين");
      return;
    }
    if (sourcePersonId === targetPersonId) {
      setError("لا يمكن ربط الشخص بنفسه");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePersonId,
          targetPersonId,
          relationshipType,
          confidenceScore,
          contextNotes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "فشل إنشاء العلاقة");
      } else {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "خطأ أثناء الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              ربط علاقة استقصائية جديدة في الشبكة
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الطرف الأول (المصدر) *
              </label>
              <select
                value={sourcePersonId}
                onChange={(e) => setSourcePersonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {allPersons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.primaryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الطرف الثاني (المرتبط به) *
              </label>
              <select
                value={targetPersonId}
                onChange={(e) => setTargetPersonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {allPersons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.primaryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                طبيعة الصلة / العلاقة *
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="lawyer">محامٍ ومستشار قانوني</option>
                <option value="business_partner">شريك تجاري واستثماري</option>
                <option value="accomplice">متواطئ / منفذ ميداني</option>
                <option value="whistleblower">مبلّغ / شاهد تسريبات</option>
                <option value="broker">وسيط مالي / صفقات</option>
                <option value="relative">قريب / صلة عائلية</option>
                <option value="adversary">خصم / طرف مناوئ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                درجة التأكيد الجنائي
              </label>
              <select
                value={confidenceScore}
                onChange={(e) => setConfidenceScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="confirmed">مؤكدة بالوثائق والأدلة (Confirmed)</option>
                <option value="suspected">مشتبه بها قيد التحقق (Suspected)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              سياق العلاقة والملاحظات الاستقصائية
            </label>
            <textarea
              rows={3}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="مثال: التنسيق المشترك لنقل الحصص في قبرص، توقيع وكالة قانونية خاصة..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition"
            >
              {loading ? "جاري الربط..." : "حفظ الصلة الشبكية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
