"use client";

import React, { useState } from "react";
import { X, FileText, Lock, Calendar, AlertTriangle } from "lucide-react";

interface NewNoteModalProps {
  personId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function NewNoteModal({
  personId,
  isOpen,
  onClose,
  onSaved,
}: NewNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("meeting_log");
  const [eventDate, setEventDate] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("العنوان ومحتوى الملاحظة مطلوبان");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/persons/${personId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category,
          eventDate,
          isConfidential,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "فشل تسجيل الملاحظة");
      } else {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-xl bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-slate-100">
              تسجيل ملاحظة استخباراتية / ميدانية
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              عنوان التقرير / الواقعة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: رصد لقاء فندق فيينا، كشوفات سويفت المسربة"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                تصنيف الملاحظة
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="meeting_log">سجل اجتماع سري (Meeting Log)</option>
                <option value="financial_trail">أثر مالي وتدفقات (Financial Trail)</option>
                <option value="background_check">فحص خلفية وتحري (Background Check)</option>
                <option value="source_leak">تسريب مصادر / مبلّغ (Source Leak)</option>
                <option value="surveillance">رصد ميداني ومراقبة (Surveillance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                تاريخ وقوع الحدث
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              محتوى التقرير والملاحظات الاستقصائية التفصيلية *
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="سجل الوقائع بالتفصيل، أرقام الحسابات، الحاضرين، وأدلة التسجيل..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              <div>
                <span className="text-xs font-bold text-red-300 block">
                  تصنيف كمحتوى سري للغاية (Top Secret / Confidential)
                </span>
                <span className="text-[11px] text-slate-400">
                  يتطلب نقرة إضافية لفك حجب النص على الشاشة وحجبه عند التصدير المنقح
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-slate-800 border-slate-700"
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
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
            >
              {loading ? "جاري الحفظ..." : "تسجيل الملاحظة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
