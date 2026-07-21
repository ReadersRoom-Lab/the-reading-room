"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BookOpen, Search, X, ExternalLink, FolderOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

// Custom Article Node Component (Rectangle Parchment Card)
function ArticleNode({
  data,
}: Readonly<
  NodeProps<
    Node<{
      id: string;
      title: string;
      source_url: string;
      reading_progress: number;
      read_time_minutes: number;
      roomName: string;
      highlightCount: number;
    }>
  >
>) {
  return (
    <div className="bg-[#FAF9F5] border-2 border-[#1A1A1A] p-4 rounded-none w-64 shadow-md text-left font-sans transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#1A1A1A] text-[#F9F7F2]">
          ARTICLE
        </span>
        <span className="text-[9px] font-medium text-[#52525B] truncate max-w-[100px]">
          {data.roomName}
        </span>
      </div>

      <h3 className="font-heading font-bold text-sm text-[#1A1A1A] mb-2 line-clamp-2 leading-snug">
        {data.title}
      </h3>

      <div className="flex items-center justify-between text-[10px] text-[#52525B] pt-2 border-t border-[#E5E5E5] mt-2">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-[#1A1A1A]" /> {data.read_time_minutes || 5} min read
        </span>
        {data.highlightCount > 0 && (
          <span className="font-semibold text-[#D17659]">{data.highlightCount} highlights</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#E5E5E5] h-1 mt-2">
        <div
          className="bg-[#1A1A1A] h-1 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, data.reading_progress || 0))}%` }}
        />
      </div>
    </div>
  );
}

// Custom Concept Node Component (Diamond Parchment Badge)
function ConceptNode({
  data,
}: Readonly<
  NodeProps<
    Node<{
      id: string;
      term: string;
      type: string;
      definition: string;
      pronunciation: string | null;
      etymology: string | null;
    }>
  >
>) {
  return (
    <div className="bg-[#F9F7F2] border-2 border-[#E6C79C] p-4 rounded-none w-60 shadow-md text-left font-sans transition-all hover:scale-105 relative">
      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[#E6C79C] text-[#1A1A1A] text-[8px] font-bold tracking-widest uppercase">
        {data.type === "concept" ? "CONCEPT" : "VOCABULARY"}
      </div>

      <div className="mt-1">
        <h3 className="font-heading font-bold text-base text-[#1A1A1A] truncate">{data.term}</h3>
        {data.pronunciation && (
          <span className="text-[10px] font-mono text-[#8C8C8C] block mb-1">
            {data.pronunciation}
          </span>
        )}
        <p className="font-source-serif italic text-xs text-[#333333] line-clamp-2 leading-relaxed mt-1">
          {data.definition}
        </p>
      </div>
    </div>
  );
}

const nodeTypes = {
  articleNode: ArticleNode,
  conceptNode: ConceptNode,
};

interface ConnectedIdeasGraphProps {
  initialNodes: Node[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialEdges: any[];
  totals: {
    articles: number;
    concepts: number;
    connections: number;
  };
}

export function ConnectedIdeasGraph({
  initialNodes,
  initialEdges,
  totals,
}: Readonly<ConnectedIdeasGraphProps>) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "articles" | "concepts">("all");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Filter nodes based on search and type filter
  const filteredNodes = useMemo(() => {
    return nodes.map((node) => {
      const isArticle = node.type === "articleNode";
      const isConcept = node.type === "conceptNode";

      let matchesFilter = true;
      if (filterType === "articles") matchesFilter = isArticle;
      if (filterType === "concepts") matchesFilter = isConcept;

      const nodeData = node.data as { title?: unknown; term?: unknown; definition?: unknown };
      let rawTitle = "";
      if (typeof nodeData.title === "string") {
        rawTitle = nodeData.title;
      } else if (typeof nodeData.term === "string") {
        rawTitle = nodeData.term;
      }
      const title = String(rawTitle);
      const def = typeof nodeData.definition === "string" ? nodeData.definition : "";
      const matchesSearch =
        !searchTerm ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        def.toLowerCase().includes(searchTerm.toLowerCase());

      const isHidden = !matchesFilter || !matchesSearch;

      return {
        ...node,
        hidden: isHidden,
      };
    });
  }, [nodes, filterType, searchTerm]);

  // Handle node selection
  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-140px)] min-h-[550px] font-sans relative">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-4 mb-4 shrink-0 bg-[#F9F7F2] z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[#1A1A1A]">Connected Ideas</h1>
            <p className="font-sans text-xs text-[#52525B] mt-0.5">
              Knowledge Graph • {totals.articles} Articles, {totals.concepts} Concepts,{" "}
              {totals.connections} Connections
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search graph nodes..."
              className="w-full pl-9 pr-4 py-2 border border-[#E5E5E5] bg-white rounded-none focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm text-[#1A1A1A] placeholder:text-[#BDBDBD]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 font-medium rounded-none transition-colors ${
              filterType === "all"
                ? "bg-[#1A1A1A] text-[#F9F7F2]"
                : "bg-white border border-[#E5E5E5] text-[#52525B] hover:text-[#1A1A1A]"
            }`}
          >
            All Nodes ({totals.articles + totals.concepts})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("articles")}
            className={`px-3 py-1.5 font-medium rounded-none transition-colors ${
              filterType === "articles"
                ? "bg-[#1A1A1A] text-[#F9F7F2]"
                : "bg-white border border-[#E5E5E5] text-[#52525B] hover:text-[#1A1A1A]"
            }`}
          >
            Articles ({totals.articles})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("concepts")}
            className={`px-3 py-1.5 font-medium rounded-none transition-colors ${
              filterType === "concepts"
                ? "bg-[#1A1A1A] text-[#F9F7F2]"
                : "bg-white border border-[#E5E5E5] text-[#52525B] hover:text-[#1A1A1A]"
            }`}
          >
            Vault Concepts ({totals.concepts})
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full border border-[#E5E5E5] bg-[#FAF9F5] relative overflow-hidden">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#E5E5E5" gap={24} size={1} />
          <Controls className="bg-white border border-[#E5E5E5] shadow-sm rounded-none" />
          <MiniMap
            className="bg-white border border-[#E5E5E5]"
            nodeColor={(n) => (n.type === "articleNode" ? "#1A1A1A" : "#E6C79C")}
          />
        </ReactFlow>
      </div>

      {/* Connection Details Side Drawer */}
      {selectedNode && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-[#E5E5E5] shadow-2xl z-20 overflow-y-auto flex flex-col p-6 font-sans">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 bg-[#1A1A1A] text-[#F9F7F2]">
              {selectedNode.type === "articleNode" ? "ARTICLE CONNECTION" : "CONCEPT CONNECTION"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1 text-[#8C8C8C] hover:text-[#1A1A1A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-6 flex flex-col gap-6 flex-1">
            {/* Article Node Details */}
            {selectedNode.type === "articleNode" && (
              <>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[#1A1A1A] mb-2">
                    {String(selectedNode.data.title)}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-[#52525B]">
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5" />
                      {String(selectedNode.data.roomName)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {typeof selectedNode.data.read_time_minutes === "number"
                        ? selectedNode.data.read_time_minutes
                        : 5}{" "}
                      min read
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] border border-[#E5E5E5] p-4 text-xs font-sans text-[#333]">
                  <span className="block font-bold text-[#8C8C8C] uppercase tracking-wider text-[9px] mb-1">
                    Reading Progress
                  </span>
                  <div className="w-full bg-[#E5E5E5] h-2 my-2">
                    <div
                      className="bg-[#1A1A1A] h-2"
                      style={{
                        width: `${Math.min(100, Math.max(0, Number(selectedNode.data.reading_progress || 0)))}%`,
                      }}
                    />
                  </div>
                  <span>
                    {Math.round(Number(selectedNode.data.reading_progress || 0))}% Completed
                  </span>
                </div>

                <Link
                  href={`/read/${selectedNode.data.id}`}
                  className="w-full py-3 bg-[#1A1A1A] text-[#F9F7F2] font-semibold text-center text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  Open in Reader <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}

            {/* Concept Node Details */}
            {selectedNode.type === "conceptNode" && (
              <>
                <div>
                  <h2 className="font-heading text-3xl font-bold text-[#1A1A1A]">
                    {String(selectedNode.data.term)}
                  </h2>
                  {Boolean(selectedNode.data.pronunciation) && (
                    <span className="text-xs font-mono text-[#8C8C8C] block mt-1">
                      {String(selectedNode.data.pronunciation)}
                    </span>
                  )}
                </div>

                <div className="bg-white border border-[#E6C79C]/40 p-5 relative shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#E6C79C]" />
                  <h4 className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#E6C79C] mb-1">
                    Meaning
                  </h4>
                  <p className="font-source-serif text-base leading-relaxed text-[#1A1A1A] italic">
                    {String(selectedNode.data.definition)}
                  </p>
                </div>

                {Boolean(selectedNode.data.etymology) && (
                  <div className="bg-[#FAF9F5] border border-[#E6C79C]/30 p-4 text-xs font-sans">
                    <span className="block font-bold text-[#E6C79C] uppercase tracking-wider text-[9px] mb-1">
                      Origin & Etymology
                    </span>
                    <p className="font-source-serif italic text-xs text-[#333]">
                      {String(selectedNode.data.etymology)}
                    </p>
                  </div>
                )}

                <Link
                  href="/vault"
                  className="w-full py-3 bg-[#1A1A1A] text-[#F9F7F2] font-semibold text-center text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  View in Vocabulary Vault <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
