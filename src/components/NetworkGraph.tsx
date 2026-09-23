"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  Filter,
  User,
  Shield,
  ExternalLink,
  Plus,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  occupation: string | null;
  avatarUrl: string | null;
  sensitivityLevel: string;
  status: string;
  reliabilityRating: number;
}

interface GraphEdge {
  id: string;
  sourcePersonId: string;
  targetPersonId: string;
  relationshipType: string;
  confidenceScore: string;
  contextNotes: string | null;
  sourcePerson: any;
  targetPerson: any;
}

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectPerson: (personId: string) => void;
  onAddRelationship: () => void;
}

export default function NetworkGraph({
  nodes,
  edges,
  onSelectPerson,
  onAddRelationship,
}: NetworkGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterConfidence, setFilterConfidence] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Position nodes in a clean radial / circular layout for clarity and stability
  const nodePositions = useMemo(() => {
    const posMap: Record<string, { x: number; y: number }> = {};
    const count = nodes.length;
    if (count === 0) return posMap;

    const centerX = 400;
    const centerY = 280;
    const radius = Math.min(centerX, centerY) - 80;

    nodes.forEach((node, idx) => {
      // Put Tariq (the main target) or the first node at center-left if multiple, or circular layout
      const angle = (idx / count) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      posMap[node.id] = { x, y };
    });

    return posMap;
  }, [nodes]);

  // Filter edges based on user selection
  const filteredEdges = useMemo(() => {
    return edges.filter((e) => {
      if (filterType !== "all" && e.relationshipType !== filterType) return false;
      if (filterConfidence !== "all" && e.confidenceScore !== filterConfidence) return false;
      return true;
    });
  }, [edges, filterType, filterConfidence]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedConnections = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter(
      (e) => e.sourcePersonId === selectedNodeId || e.targetPersonId === selectedNodeId
    );
  }, [edges, selectedNodeId]);

  const getEdgeColor = (type: string) => {
    switch (type) {
      case "lawyer":
        return "#a855f7"; // purple
      case "business_partner":
        return "#3b82f6"; // blue
      case "accomplice":
        return "#ef4444"; // red
      case "whistleblower":
        return "#10b981"; // emerald
      case "broker":
        return "#f59e0b"; // amber
      case "relative":
        return "#06b6d4"; // cyan
      default:
        return "#94a3b8"; // slate
    }
  };

  const getRelationshipArabic = (type: string) => {
    switch (type) {
      case "lawyer":
        return "محامٍ قانوني";
      case "business_partner":
        return "شريك أعمال";
      case "accomplice":
        return "متواطئ";
      case "whistleblower":
        return "مبلّغ / مصدر";
      case "broker":
        return "وسيط مالي";
      case "relative":
        return "قريب";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Control / Filter Bar */}
      <div className="bg-[#0e1422] border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Network className="w-5 h-5 text-cyan-400" />
            <span>مخطط شبكة العلاقات الاستخباراتية</span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">نوع الصلة:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="all">جميع الصلات ({edges.length})</option>
              <option value="lawyer">محامٍ / مستشار قانوني</option>
              <option value="business_partner">شريك تجاري</option>
              <option value="accomplice">متواطئ / منفذ</option>
              <option value="whistleblower">مبلّغ / مصدر</option>
              <option value="broker">وسيط مالي</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">درجة التأكيد:</span>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="all">الكل</option>
              <option value="confirmed">مؤكدة فقط</option>
              <option value="suspected">مشتبهة فقط</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddRelationship}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ربط علاقة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Canvas and Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual SVG Canvas */}
        <div className="lg:col-span-2 bg-[#090d18] border border-slate-800 rounded-2xl p-4 relative overflow-hidden min-h-[560px] flex items-center justify-center shadow-inner">
          {/* Legend Overlay */}
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] space-y-1.5 z-10">
            <span className="font-bold text-slate-400 block mb-1">دليل الصلات:</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-[#a855f7]" />
              <span className="text-slate-300">محامٍ قانوني</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-[#ef4444]" />
              <span className="text-slate-300">متواطئ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-[#10b981]" />
              <span className="text-slate-300">مبلّغ / مصدر</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-[#3b82f6]" />
              <span className="text-slate-300">شريك تجاري</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 rounded bg-[#f59e0b]" />
              <span className="text-slate-300">وسيط مالي</span>
            </div>
          </div>

          <svg
            className="w-full h-[540px] select-none"
            viewBox="0 0 800 560"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Markers for directional relationships */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="26"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
            </defs>

            {/* Grid Pattern Background */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131c31" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges / Relationship Lines */}
            {filteredEdges.map((edge) => {
              const p1 = nodePositions[edge.sourcePersonId];
              const p2 = nodePositions[edge.targetPersonId];
              if (!p1 || !p2) return null;

              const isHighlighted =
                selectedNodeId &&
                (edge.sourcePersonId === selectedNodeId || edge.targetPersonId === selectedNodeId);
              const color = getEdgeColor(edge.relationshipType);

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              return (
                <g key={edge.id} className="cursor-pointer group">
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={color}
                    strokeWidth={isHighlighted ? 3 : 1.8}
                    strokeDasharray={edge.confidenceScore === "suspected" ? "4 4" : undefined}
                    strokeOpacity={selectedNodeId ? (isHighlighted ? 1 : 0.25) : 0.8}
                    className="transition-all"
                  />
                  {/* Text label on line */}
                  <rect
                    x={midX - 35}
                    y={midY - 10}
                    width="70"
                    height="18"
                    rx="4"
                    fill="#0b101d"
                    stroke={color}
                    strokeWidth="0.8"
                    opacity={selectedNodeId ? (isHighlighted ? 0.95 : 0.3) : 0.85}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="9"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                    opacity={selectedNodeId ? (isHighlighted ? 1 : 0.4) : 0.9}
                  >
                    {getRelationshipArabic(edge.relationshipType)}
                  </text>
                </g>
              );
            })}

            {/* Nodes / Persons */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = node.id === selectedNodeId;
              const isSource = node.status === "source";

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform duration-150 hover:scale-105"
                >
                  {/* Glow circle if selected */}
                  {isSelected && (
                    <circle
                      r="36"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin origin-center"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    r="26"
                    fill="#111827"
                    stroke={
                      isSelected
                        ? "#f59e0b"
                        : isSource
                        ? "#10b981"
                        : node.sensitivityLevel === "top_secret"
                        ? "#ef4444"
                        : "#3b82f6"
                    }
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Node Name abbreviation / Icon */}
                  <text
                    y="5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.name.split(" ")[0] || "شخص"}
                  </text>

                  {/* Node Label Below */}
                  <rect
                    x="-65"
                    y="32"
                    width="130"
                    height="20"
                    rx="5"
                    fill="#0e1422"
                    stroke="#1e293b"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="46"
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="9.5"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {node.name.length > 18 ? node.name.substring(0, 16) + "..." : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Inspector Panel for Selected Node */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold text-slate-400">لوحة فحص الهدف المختار</span>
              {selectedNode && (
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  إلغاء التحديد
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedNode.avatarUrl ? (
                    <img
                      src={selectedNode.avatarUrl}
                      alt={selectedNode.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-slate-300">
                      {selectedNode.name.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{selectedNode.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {selectedNode.occupation || "بدون مهنة محددة"}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-mono ${
                        selectedNode.sensitivityLevel === "top_secret"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {selectedNode.sensitivityLevel === "top_secret" ? "سري للغاية" : "سري"}
                    </span>
                  </div>
                </div>

                {/* Direct connections list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2">
                    الصلات المباشرة في الشبكة ({selectedConnections.length}):
                  </h4>

                  {selectedConnections.length === 0 ? (
                    <p className="text-xs text-slate-500">لا توجد صلات مسجلة لهذا الشخص.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedConnections.map((c) => {
                        const isSource = c.sourcePersonId === selectedNode.id;
                        const otherPerson = isSource ? c.targetPerson : c.sourcePerson;
                        const edgeColor = getEdgeColor(c.relationshipType);

                        return (
                          <div
                            key={c.id}
                            className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span
                                className="inline-block text-[10px] px-1.5 py-0.2 rounded font-bold mb-1"
                                style={{ backgroundColor: `${edgeColor}20`, color: edgeColor }}
                              >
                                {getRelationshipArabic(c.relationshipType)}
                              </span>
                              <p className="font-semibold text-slate-200">
                                {otherPerson ? otherPerson.primaryName : "طرف آخر"}
                              </p>
                              {c.contextNotes && (
                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                  {c.contextNotes}
                                </p>
                              )}
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono">
                              {c.confidenceScore === "confirmed" ? "مؤكد" : "مشتبه"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Info className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  اضغط على أي عقدة في الرسم البياني لعرض تفاصيل الهدف وصلاته الاستقصائية
                </p>
              </div>
            )}
          </div>

          {selectedNode && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onSelectPerson(selectedNode.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-950/40"
              >
                <span>الانتقال للملف الاستقصائي الكامل</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
