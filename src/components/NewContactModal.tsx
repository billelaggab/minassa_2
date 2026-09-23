"use client";

import React, { useState } from "react";
import { X, PhoneCall, Mail, Share2, AlertTriangle, Key } from "lucide-react";

interface NewContactModalProps {
  personId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function NewContactModal({
  personId,
  isOpen,
  onClose,
  onSaved,
}: NewContactModalProps) {
  const [channelType, setChannelType] = useState<"phone" | "email" | "social">("phone");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [hasSignal, setHasSignal] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [carrierNotes, setCarrierNotes] = useState("");
  const [pgpPublicKey, setPgpPublicKey] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("قيمة قناة الاتصال مطلوبة");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/persons/${personId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelType,
          value,
          label,
          hasWhatsapp,
          hasSignal,
          hasTelegram,
          carrierNotes,
          pgpPublicKey,
          profileUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "فشل إضافة وسيلة الاتصال");
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
        className="w-full max-w-lg bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">إضافة قناة اتصال جديدة</h3>
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

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setChannelType("phone")}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                channelType === "phone"
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              هاتف / محمول
            </button>
            <button
              type="button"
              onClick={() => setChannelType("email")}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                channelType === "email"
                  ? "bg-cyan-600/20 text-cyan-300 border-cyan-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              بريد إلكتروني
            </button>
            <button
              type="button"
              onClick={() => setChannelType("social")}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                channelType === "social"
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              معرف تواصل
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {channelType === "phone"
                ? "رقم الهاتف (E.164)"
                : channelType === "email"
                ? "عنوان البريد الإلكتروني"
                : "اسم المستخدم / المعرّف"}
              *
            </label>
            <input
              type="text"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                channelType === "phone"
                  ? "+971501234567"
                  : channelType === "email"
                  ? "source@protonmail.com"
                  : "@username"
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              التصنيف / الوصف
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="مثال: شخصي رئيسي، هاتف سري Burner، بريد مسرب، تيليغرام"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {channelType === "phone" && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="block text-xs font-semibold text-slate-300">
                التطبيقات المشفرة النشطة:
              </span>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSignal}
                    onChange={(e) => setHasSignal(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0 bg-slate-800"
                  />
                  <span>Signal (مشفر آمن)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTelegram}
                    onChange={(e) => setHasTelegram(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-800"
                  />
                  <span>Telegram</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWhatsapp}
                    onChange={(e) => setHasWhatsapp(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0 bg-slate-800"
                  />
                  <span>WhatsApp</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ملاحظات مزود الخدمة / الشبكة (Carrier / ISP Notes)
            </label>
            <input
              type="text"
              value={carrierNotes}
              onChange={(e) => setCarrierNotes(e.target.value)}
              placeholder="مثال: شريحة مجهولة الهوية، شركة اتصالات محددة، خادم خاص"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {channelType === "email" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>مفتاح PGP العام (اختياري)</span>
              </label>
              <textarea
                rows={3}
                value={pgpPublicKey}
                onChange={(e) => setPgpPublicKey(e.target.value)}
                placeholder="-----BEGIN PGP PUBLIC KEY BLOCK----- ..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition"
            >
              {loading ? "جاري الحفظ..." : "إضافة القناة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
