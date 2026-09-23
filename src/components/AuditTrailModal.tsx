"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, History, RefreshCw, Key, AlertCircle } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditTrailModal({ isOpen, onClose }: AuditTrailModalProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Audit log error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    if (action.includes("CREATED") || action.includes("RECORDED")) {
      return "bg-emerald-950 text-emerald-300 border-emerald-800";
    }
    if (action.includes("DELETED") || action.includes("DESTROYED")) {
      return "bg-red-950 text-red-300 border-red-800";
    }
    if (action.includes("EXPORTED")) {
      return "bg-cyan-950 text-cyan-300 border-cyan-800";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl bg-[#0e1422] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                سجل الحركات الجنائية والتدقيق الأمني (Audit Trail)
              </h3>
              <p className="text-[11px] text-slate-400">
                توثيق غير قابل للتعديل لعمليات الوصول، التصدير، والإيداع الرقمي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">جاري تحميل السجلات...</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">لا توجد حركات مسجلة</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      الكيان: {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) : "—"})
                    </span>
                  </div>
                  <p className="text-slate-200">{log.details}</p>
                </div>

                <div className="text-left shrink-0 text-[10px] font-mono text-slate-500">
                  <p>{new Date(log.createdAt).toLocaleString("ar-EG")}</p>
                  <p className="text-slate-600">{log.ipAddress || "127.0.0.1"}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>التشفير: HMAC-SHA256 Hash Chained Logs</span>
          <span>إجمالي السجلات: {logs.length}</span>
        </div>
      </div>
    </div>
  );
}
