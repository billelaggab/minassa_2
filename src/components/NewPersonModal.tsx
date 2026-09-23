"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Shield, Star, AlertTriangle } from "lucide-react";
import { PersonItem } from "./DossierCard";

interface NewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  personToEdit?: PersonItem | null;
}

export default function NewPersonModal({
  isOpen,
  onClose,
  onSaved,
  personToEdit,
}: NewPersonModalProps) {
  const [primaryName, setPrimaryName] = useState("");
  const [aliases, setAliases] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [reliabilityRating, setReliabilityRating] = useState(3);
  const [sensitivityLevel, setSensitivityLevel] = useState("confidential");
  const [status, setStatus] = useState("under_investigation");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (personToEdit) {
      setPrimaryName(personToEdit.primaryName || "");
      setAliases(
        personToEdit.aliasesList ? personToEdit.aliasesList.join("، ") : personToEdit.aliases || ""
      );
      setAvatarUrl(personToEdit.avatarUrl || "");
      setDob(personToEdit.dob || "");
      setNationality(personToEdit.nationality || "");
      setOccupation(personToEdit.occupation || "");
      setAddress(personToEdit.address || "");
      setReliabilityRating(personToEdit.reliabilityRating || 3);
      setSensitivityLevel(personToEdit.sensitivityLevel || "confidential");
      setStatus(personToEdit.status || "under_investigation");
      setSummary(personToEdit.summary || "");
    } else {
      setPrimaryName("");
      setAliases("");
      setAvatarUrl("");
      setDob("");
      setNationality("");
      setOccupation("");
      setAddress("");
      setReliabilityRating(3);
      setSensitivityLevel("confidential");
      setStatus("under_investigation");
      setSummary("");
    }
    setError("");
  }, [personToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName.trim()) {
      setError("الاسم الكامل مطلوب لإصدار الملف");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = personToEdit ? `/api/persons/${personToEdit.id}` : "/api/persons";
      const method = personToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryName,
          aliases,
          avatarUrl,
          dob,
          nationality,
          occupation,
          address,
          reliabilityRating,
          sensitivityLevel,
          status,
          summary,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "حدث خطأ أثناء حفظ الملف");
      } else {
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              {personToEdit ? "تعديل الملف الاستقصائي" : "فتح ملف استقصائي جديد"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الاسم الكامل الرئيسي *
              </label>
              <input
                type="text"
                required
                value={primaryName}
                onChange={(e) => setPrimaryName(e.target.value)}
                placeholder="مثال: طارق عبد الرحمن المنصوري"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                الأسماء المستعارة / الحركية (مفصولة بفواصل)
              </label>
              <input
                type="text"
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="مثال: أبو يوسف، Falcon-7، الوسيط"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                رابط الصورة الشخصية (اختياري)
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... أو مسار محلي"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                المهنة الأساسية / الغطاء
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="مثال: رئيس مجلس إدارة شركة ملاحة"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الجنسية</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="مثال: إماراتي / كندي"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ الميلاد</label>
              <input
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="YYYY-MM-DD"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                العنوان الفعلي الحالي
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المدينة، الحي، المبنى"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                درجة السرية والتصنيف الأمني
              </label>
              <select
                value={sensitivityLevel}
                onChange={(e) => setSensitivityLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="public">معلومات عامة (Public)</option>
                <option value="confidential">سري ومحمي (Confidential)</option>
                <option value="top_secret">سري للغاية (Top Secret)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">حالة الهدف</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="under_investigation">قيد التحقيق النشط</option>
                <option value="monitored">تحت المراقبة والرصد</option>
                <option value="source">مصدر سري / مبلّغ</option>
                <option value="witness">شاهد متعاون</option>
                <option value="archived">أرشيف مغلق</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                مستوى الموثوقية الاستخباراتية (1 إلى 5)
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-700">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReliabilityRating(star)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reliabilityRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-400 mr-2 font-mono">
                  {reliabilityRating} من 5 درجات
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ملخص التحقيق الاستقصائي
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="نبذة موجزة عن خلفية التحقيق، الشبهات، والدوافع الاستقصائية..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
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
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-950/40"
            >
              {loading ? "جاري الحفظ..." : personToEdit ? "حفظ التعديلات" : "إصدار الملف الاستقصائي"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
