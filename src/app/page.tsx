"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import DossierCard, { PersonItem } from "@/components/DossierCard";
import DossierDetail, {
  ContactChannel,
  IntelligenceNote,
  AttachmentItem,
  RelationshipItem,
} from "@/components/DossierDetail";
import NetworkGraph from "@/components/NetworkGraph";
import SearchModal from "@/components/SearchModal";
import DossierExportModal from "@/components/DossierExportModal";
import NewPersonModal from "@/components/NewPersonModal";
import NewContactModal from "@/components/NewContactModal";
import NewNoteModal from "@/components/NewNoteModal";
import UploadEvidenceModal from "@/components/UploadEvidenceModal";
import NewRelationshipModal from "@/components/NewRelationshipModal";
import MediaLightbox from "@/components/MediaLightbox";
import AuditTrailModal from "@/components/AuditTrailModal";
import {
  Users,
  Network,
  Shield,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { normalizeArabic } from "@/lib/arabic-search";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"persons" | "network" | "search" | "audit">("persons");
  const [personsList, setPersonsList] = useState<PersonItem[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Active Person Full Data
  const [activePersonData, setActivePersonData] = useState<{
    person: PersonItem;
    contacts: ContactChannel[];
    notes: IntelligenceNote[];
    attachments: AttachmentItem[];
    relationships: RelationshipItem[];
  } | null>(null);
  const [loadingActivePerson, setLoadingActivePerson] = useState(false);

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Network graph data
  const [networkNodes, setNetworkNodes] = useState<any[]>([]);
  const [networkEdges, setNetworkEdges] = useState<any[]>([]);

  // Filters for dossiers list
  const [filterSensitivity, setFilterSensitivity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSearch, setFilterSearch] = useState<string>("");

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPersonId, setExportPersonId] = useState<string | null>(null);
  const [isNewPersonOpen, setIsNewPersonOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<PersonItem | null>(null);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewRelationshipOpen, setIsNewRelationshipOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<AttachmentItem | null>(null);

  // Fetch list of persons
  const fetchPersons = useCallback(async () => {
    setLoadingPersons(true);
    try {
      const res = await fetch("/api/persons");
      const data = await res.json();
      if (data.success) {
        setPersonsList(data.persons);
      }
    } catch (err) {
      console.error("Failed to fetch persons:", err);
    } finally {
      setLoadingPersons(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  // Fetch network data
  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetch("/api/relationships");
      const data = await res.json();
      if (data.success) {
        setNetworkNodes(data.nodes);
        setNetworkEdges(data.relationships);
      }
    } catch (err) {
      console.error("Failed to fetch network:", err);
    }
  }, []);

  // Fetch single person full dossier
  const fetchPersonDetail = useCallback(async (id: string) => {
    setLoadingActivePerson(true);
    try {
      const res = await fetch(`/api/persons/${id}`);
      const data = await res.json();
      if (data.success) {
        setActivePersonData({
          person: data.person,
          contacts: data.contacts,
          notes: data.notes,
          attachments: data.attachments,
          relationships: data.relationships,
        });
      }
    } catch (err) {
      console.error("Failed to fetch person detail:", err);
    } finally {
      setLoadingActivePerson(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
    fetchStats();
    fetchNetwork();
  }, [fetchPersons, fetchStats, fetchNetwork]);

  useEffect(() => {
    if (selectedPersonId) {
      fetchPersonDetail(selectedPersonId);
    } else {
      setActivePersonData(null);
    }
  }, [selectedPersonId, fetchPersonDetail]);

  const handleOpenExport = (id: string) => {
    setExportPersonId(id);
    setIsExportOpen(true);
  };

  const handleOpenEdit = () => {
    if (activePersonData?.person) {
      setPersonToEdit(activePersonData.person);
      setIsNewPersonOpen(true);
    }
  };

  const handleDeletePerson = async () => {
    if (!selectedPersonId) return;
    if (!confirm("هل أنت متأكد من حذف هذا الملف الاستقصائي بالكامل مع كافة الملاحظات والأدلة؟")) return;

    try {
      const res = await fetch(`/api/persons/${selectedPersonId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSelectedPersonId(null);
        fetchPersons();
        fetchStats();
        fetchNetwork();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("هل أنت متأكد من حذف وسيلة الاتصال هذه؟")) return;
    try {
      const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && selectedPersonId) {
        fetchPersonDetail(selectedPersonId);
        fetchPersons();
      }
    } catch (err) {
      console.error("Delete contact error:", err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الملاحظة الاستخباراتية؟")) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && selectedPersonId) {
        fetchPersonDetail(selectedPersonId);
        fetchPersons();
      }
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!confirm("هل أنت متأكد من إتلاف/حذف هذا الحرز الرقمي من سلسلة الحيازة؟")) return;
    try {
      const res = await fetch(`/api/attachments/${fileId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && selectedPersonId) {
        fetchPersonDetail(selectedPersonId);
        fetchPersons();
        fetchStats();
      }
    } catch (err) {
      console.error("Delete attachment error:", err);
    }
  };

  const handleDeleteRelationship = async (relId: string) => {
    if (!confirm("هل أنت متأكد من فك ارتباط هذه العلاقة؟")) return;
    try {
      const res = await fetch(`/api/relationships/${relId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && selectedPersonId) {
        fetchPersonDetail(selectedPersonId);
        fetchNetwork();
      }
    } catch (err) {
      console.error("Delete rel error:", err);
    }
  };

  // Filtered persons
  const filteredPersons = personsList.filter((p) => {
    if (filterSensitivity !== "all" && p.sensitivityLevel !== filterSensitivity) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterSearch.trim()) {
      const normQ = normalizeArabic(filterSearch);
      const normName = normalizeArabic(p.primaryName);
      const normOcc = normalizeArabic(p.occupation);
      const normAliases = normalizeArabic(p.aliases);
      if (!normName.includes(normQ) && !normOcc.includes(normQ) && !normAliases.includes(normQ)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "persons") setSelectedPersonId(null);
        }}
        onOpenNewPerson={() => {
          setPersonToEdit(null);
          setIsNewPersonOpen(true);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAudit={() => setIsAuditOpen(true)}
        stats={stats}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If Active Person Detail is open */}
        {selectedPersonId && activePersonData ? (
          <DossierDetail
            person={activePersonData.person}
            contacts={activePersonData.contacts}
            notes={activePersonData.notes}
            attachments={activePersonData.attachments}
            relationships={activePersonData.relationships}
            onBack={() => setSelectedPersonId(null)}
            onOpenExport={handleOpenExport}
            onOpenEdit={handleOpenEdit}
            onDeletePerson={handleDeletePerson}
            onAddContact={() => setIsNewContactOpen(true)}
            onDeleteContact={handleDeleteContact}
            onAddNote={() => setIsNewNoteOpen(true)}
            onDeleteNote={handleDeleteNote}
            onAddAttachment={() => setIsUploadOpen(true)}
            onDeleteAttachment={handleDeleteAttachment}
            onAddRelationship={() => setIsNewRelationshipOpen(true)}
            onDeleteRelationship={handleDeleteRelationship}
            onPreviewMedia={(media) => setPreviewMedia(media)}
          />
        ) : activeTab === "network" ? (
          /* Network Graph View */
          <NetworkGraph
            nodes={networkNodes}
            edges={networkEdges}
            onSelectPerson={(id) => {
              setSelectedPersonId(id);
              setActiveTab("persons");
            }}
            onAddRelationship={() => setIsNewRelationshipOpen(true)}
          />
        ) : activeTab === "search" ? (
          /* Dedicated Search Engine & Normalization Explorer */
          <div className="space-y-6">
            <div className="bg-[#0e1422] border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    محرك البحث الاستقصائي المتكامل مع خوارزميات Meilisearch
                  </h2>
                  <p className="text-xs text-slate-400">
                    بحث فوري يشمل الأسماء، الأسماء الحركية، أرقام الهواتف، البريد، نصوص الملاحظات، وبصمات SHA-256
                  </p>
                </div>
              </div>

              {/* Live search input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="اكتب كلمة بحث لتجربة التطبيع العربي: مثل 'طارق' أو 'إفادة' أو 'البغدادي' أو '050'..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 pr-11 focus:outline-none focus:border-purple-500"
                />
                <Search className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
              </div>

              {/* Arabic normalization rules card */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>قواعد التطبيع اللغوي العربي المطبقة آلياً:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="block font-bold text-amber-300 mb-1">الهمزات والألف:</span>
                    <span>(أ / إ / آ / ٱ) &larr; تُعامل كـ (ا)</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="block font-bold text-emerald-300 mb-1">التاء والهاء:</span>
                    <span>(ة) &larr; تُعامل كـ (ه)</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="block font-bold text-cyan-300 mb-1">الياء والألف المقصورة:</span>
                    <span>(ى / ي) &larr; تُعامل كـ (ي)</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="block font-bold text-red-300 mb-1">إهمال التشكيل:</span>
                    <span>إزالة الحركات، الشدة، والتطويل (ـ)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Trigger Modal */}
            <div className="text-center py-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/40 inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>فتح نافذة البحث السريع الفوري (Ctrl + K)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Persons Directory View */
          <div className="space-y-6">
            {/* Filter and stats row */}
            <div className="bg-[#0e1422] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span>تصفية السجلات:</span>
                </div>

                {/* Sensitivity filter */}
                <select
                  value={filterSensitivity}
                  onChange={(e) => setFilterSensitivity(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value="all">كافة مستويات السرية</option>
                  <option value="top_secret">سري للغاية (Top Secret)</option>
                  <option value="confidential">سري (Confidential)</option>
                  <option value="public">عام (Public)</option>
                </select>

                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value="all">كافة الحالات</option>
                  <option value="under_investigation">قيد التحقيق النشط</option>
                  <option value="monitored">تحت المراقبة والرصد</option>
                  <option value="source">مصادر ومبلّغين</option>
                  <option value="witness">شهود</option>
                  <option value="archived">أرشيف</option>
                </select>

                {/* Search input in directory */}
                <div className="relative">
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="بحث في القائمة..."
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 pr-8 rounded-lg focus:outline-none w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  إجمالي النتائج: {filteredPersons.length} ملف
                </span>

                <button
                  onClick={fetchPersons}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPersons ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Dossiers Grid */}
            {loadingPersons ? (
              <div className="py-20 text-center text-slate-400">
                <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs">جاري تحميل السجلات والملفات الاستقصائية من خادم البيانات المحلي...</p>
              </div>
            ) : filteredPersons.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-[#0e1422] border border-slate-800 rounded-2xl p-8">
                <Shield className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">لا توجد ملفات تطابق معايير التصفية</h3>
                <p className="text-xs text-slate-500 mt-1">
                  جرب تغيير التصنيف الأمني أو إفراغ خانة البحث
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPersons.map((person) => (
                  <DossierCard
                    key={person.id}
                    person={person}
                    onOpenDetail={(id) => setSelectedPersonId(id)}
                    onOpenExport={handleOpenExport}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080b14] py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>منظومة إدارة الاستخبارات الاستقصائية • تعمل محلياً بوضع عدم الاتصال 100%</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>التوثيق الجنائي: SHA-256</span>
            <span>التشفير: Local SQLite/PostgreSQL</span>
            <span>RTL Native Engine</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPerson={(id) => {
          setSelectedPersonId(id);
          setActiveTab("persons");
        }}
      />

      <DossierExportModal
        isOpen={isExportOpen}
        personId={exportPersonId}
        onClose={() => {
          setIsExportOpen(false);
          setExportPersonId(null);
        }}
      />

      <NewPersonModal
        isOpen={isNewPersonOpen}
        personToEdit={personToEdit}
        onClose={() => {
          setIsNewPersonOpen(false);
          setPersonToEdit(null);
        }}
        onSaved={() => {
          fetchPersons();
          fetchStats();
          fetchNetwork();
          if (selectedPersonId) fetchPersonDetail(selectedPersonId);
        }}
      />

      {selectedPersonId && (
        <>
          <NewContactModal
            isOpen={isNewContactOpen}
            personId={selectedPersonId}
            onClose={() => setIsNewContactOpen(false)}
            onSaved={() => {
              fetchPersonDetail(selectedPersonId);
              fetchPersons();
              fetchStats();
            }}
          />

          <NewNoteModal
            isOpen={isNewNoteOpen}
            personId={selectedPersonId}
            onClose={() => setIsNewNoteOpen(false)}
            onSaved={() => {
              fetchPersonDetail(selectedPersonId);
              fetchPersons();
              fetchStats();
            }}
          />

          <UploadEvidenceModal
            isOpen={isUploadOpen}
            personId={selectedPersonId}
            onClose={() => setIsUploadOpen(false)}
            onSaved={() => {
              fetchPersonDetail(selectedPersonId);
              fetchPersons();
              fetchStats();
            }}
          />
        </>
      )}

      <NewRelationshipModal
        isOpen={isNewRelationshipOpen}
        currentPersonId={selectedPersonId || undefined}
        allPersons={personsList}
        onClose={() => setIsNewRelationshipOpen(false)}
        onSaved={() => {
          if (selectedPersonId) fetchPersonDetail(selectedPersonId);
          fetchNetwork();
          fetchPersons();
          fetchStats();
        }}
      />

      <MediaLightbox attachment={previewMedia} onClose={() => setPreviewMedia(null)} />

      <AuditTrailModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </div>
  );
}
