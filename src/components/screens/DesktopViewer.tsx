import React, { useState } from "react";
import { Search, Download, Share2, Filter, ChevronRight, Plus, Settings, MessageCircle, FileText, FileBarChart, StickyNote, Paperclip } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TranscriptRow } from "../classnote/TranscriptRow";
import { ChartBlock } from "../classnote/ChartBlock";
import { TableBlock } from "../classnote/TableBlock";
import { AnimeNavBar } from "../ui/anime-navbar";
import type { LectureCardProps } from "../classnote/LectureCard";

interface DesktopViewerProps {
  lectures: LectureCardProps[];
  onNewRecording: () => void;
  onSettings: () => void;
  onChat: () => void;
}

export function DesktopViewer({ lectures, onNewRecording, onSettings, onChat }: DesktopViewerProps) {
  const [selectedLecture, setSelectedLecture] = useState(lectures[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Summary");

  // Navigation items for the animated navbar
  const navItems = [
    { name: "Summary", screen: "Summary", icon: FileBarChart },
    { name: "Transcript", screen: "Transcript", icon: FileText },
    { name: "Notes", screen: "Notes", icon: StickyNote },
    { name: "Assets", screen: "Assets", icon: Paperclip },
  ];

  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecture.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabNavigation = (screenName: string) => {
    setActiveTab(screenName);
  };

  // Mock data
  const transcriptData: Array<{
    timestamp: string;
    text: string;
    marker?: {
      type: "Key Point" | "Assignment" | "Exam Tip";
      color: string;
    };
  }> = [
    {
      timestamp: "00:23",
      text: "Today we're going to explore two fundamental programming paradigms: greedy algorithms and dynamic programming.",
    },
    {
      timestamp: "10:23",
      text: "A greedy algorithm makes the locally optimal choice at each stage with the hope of finding a global optimum.",
      marker: { type: "Key Point" as const, color: "#F5F7FA" },
    },
    {
      timestamp: "18:45",
      text: "Dynamic programming, on the other hand, breaks down problems into simpler subproblems and stores their solutions.",
    },
    {
      timestamp: "32:11",
      text: "Your assignment for next week is to implement both a greedy and DP solution to the coin change problem.",
      marker: { type: "Assignment" as const, color: "#F5F7FA" },
    },
  ];

  const emphasisData = [
    { name: "Greedy", value: 25 },
    { name: "DP", value: 30 },
    { name: "Examples", value: 20 },
    { name: "Theory", value: 15 },
    { name: "Practice", value: 10 },
  ];

  const conceptTable = {
    headers: ["Concept", "Definition", "Example"],
    rows: [
      ["Greedy Algorithm", "Makes locally optimal choices", "Dijkstra's Algorithm"],
      ["Dynamic Programming", "Stores subproblem solutions", "Fibonacci Sequence"],
      ["Optimal Substructure", "Optimal solution contains optimal subsolutions", "Shortest Path"],
    ],
  };

  const statusColors = {
    Recorded: "bg-[#2A2C31] text-[#A6A8AD]",
    Processing: "bg-[#2A2C31] text-[#E5E7EB]",
    Ready: "bg-[#F5F7FA] text-[#0B0B0C]",
    Flagged: "bg-[#DC2626] text-[#F5F7FA]"
  };

  return (
    <div className="h-screen bg-[#0B0B0C] flex relative">
      {/* Animated Navigation Bar */}
      <AnimeNavBar 
        items={navItems}
        onNavigate={handleTabNavigation}
        currentActiveScreen={activeTab}
        defaultActive="Summary"
      />
      {/* Left Sidebar - Lecture List */}
      <div className="w-80 bg-[#121315] border-r border-[#2A2C31] flex flex-col">
        <div className="p-6 border-b border-[#2A2C31]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[#F5F7FA]">ClassNote AI</h1>
            <button
              onClick={onSettings}
              className="p-2 rounded-lg hover:bg-[#1C1D20] transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-[#A6A8AD] hover:text-[#F5F7FA]" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A6A8AD]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures..."
              className="pl-9 bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA] placeholder:text-[#A6A8AD] h-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* New Recording Button */}
          <button
            onClick={onNewRecording}
            className="w-full p-4 rounded-xl bg-[#1C1D20] border border-[#2A2C31] hover:bg-[#2A2C31] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F5F7FA] text-[#0B0B0C] flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[#F5F7FA] text-sm font-medium">New Recording</h3>
                <p className="text-[#A6A8AD] text-xs">Start a new lecture</p>
              </div>
            </div>
          </button>
          
          {filteredLectures.map(lecture => (
            <button
              key={lecture.id}
              onClick={() => setSelectedLecture(lecture)}
              className={`w-full text-left p-4 rounded-xl transition-colors ${
                selectedLecture.id === lecture.id
                  ? "bg-[#1C1D20] border border-[#2A2C31]"
                  : "hover:bg-[#1C1D20]/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[#F5F7FA] text-sm">{lecture.title}</h3>
                <Badge className={`${statusColors[lecture.status]} border-0 text-xs`}>
                  {lecture.status}
                </Badge>
              </div>
              <p className="text-[#A6A8AD] text-xs mb-2">{lecture.course}</p>
              <div className="flex items-center gap-2 text-[#A6A8AD] text-xs">
                <span>{lecture.duration}</span>
                <span>•</span>
                <span>{lecture.date}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-50">
        {/* Chatbot Button */}
        <button
          onClick={onChat}
          className="w-14 h-14 rounded-full bg-[#1C1D20] border border-[#2A2C31] text-[#F5F7FA] shadow-lg flex items-center justify-center hover:bg-[#2A2C31] transition-colors"
          title="AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        
        {/* New Recording Button */}
        <button
          onClick={onNewRecording}
          className="w-14 h-14 rounded-full bg-[#F5F7FA] text-[#0B0B0C] shadow-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
          title="New Recording"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#121315] border-b border-[#2A2C31] px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-[#F5F7FA] mb-2">{selectedLecture.title}</h2>
              <p className="text-[#A6A8AD]">{selectedLecture.course}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB]">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#A6A8AD] text-sm">
            <span>{selectedLecture.date}</span>
            <span>•</span>
            <span>{selectedLecture.duration}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Summary Tab Content */}
            {activeTab === "Summary" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h3 className="text-[#F5F7FA] mb-4">Executive Summary</h3>
                  <p className="text-[#E5E7EB] leading-relaxed">
                    This lecture covered two fundamental algorithmic paradigms: greedy algorithms and dynamic programming.
                    The session explored when to use each approach, their time complexities, and real-world applications.
                    Key examples included Dijkstra's algorithm for greedy and the Fibonacci sequence for DP.
                  </p>
                </div>

                <div>
                  <h3 className="text-[#F5F7FA] mb-4">Key Takeaways</h3>
                  <ul className="space-y-3 text-[#E5E7EB]">
                    <li className="flex gap-3">
                      <span className="text-[#A6A8AD]">•</span>
                      <span>Greedy algorithms make locally optimal choices at each step</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#A6A8AD]">•</span>
                      <span>Dynamic programming stores solutions to subproblems to avoid recomputation</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#A6A8AD]">•</span>
                      <span>Check for optimal substructure before applying DP</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#A6A8AD]">•</span>
                      <span>Assignment: Implement coin change using both approaches</span>
                    </li>
                  </ul>
                </div>

                <ChartBlock title="Topic Emphasis (minutes)" data={emphasisData} />
                </div>
              </div>
            )}

            {/* Transcript Tab Content */}
            {activeTab === "Transcript" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                <div className="space-y-1">
                  {transcriptData.map((item, index) => {
                    const { timestamp, text, marker } = item;
                    return React.createElement(TranscriptRow, {
                      key: index,
                      timestamp,
                      text,
                      marker
                    });
                  })}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab Content */}
            {activeTab === "Notes" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h3 className="text-[#F5F7FA] mb-4">Core Concepts</h3>
                  <div className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-6">
                    <h4 className="text-[#F5F7FA] mb-3">Greedy Algorithms</h4>
                    <ul className="space-y-2 text-[#E5E7EB] mb-6">
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Make the locally optimal choice at each stage</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Hope to find a global optimum</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Example: Dijkstra's shortest path algorithm</span>
                      </li>
                    </ul>

                    <h4 className="text-[#F5F7FA] mb-3">Dynamic Programming</h4>
                    <ul className="space-y-2 text-[#E5E7EB]">
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Break down into simpler subproblems</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Store solutions to avoid recomputation</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-[#A6A8AD]">•</span>
                        <span>Requires optimal substructure property</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <TableBlock title="Definitions" {...conceptTable} />
                <ChartBlock title="Topic Emphasis" data={emphasisData} />
                </div>
              </div>
            )}

            {/* Assets Tab Content */}
            {activeTab === "Assets" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#121315] border border-[#2A2C31] flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-[#A6A8AD]" />
                </div>
                <h3 className="text-[#F5F7FA] mb-2">No assets yet</h3>
                <p className="text-[#A6A8AD]">
                  Slide photos and attachments will appear here
                </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
