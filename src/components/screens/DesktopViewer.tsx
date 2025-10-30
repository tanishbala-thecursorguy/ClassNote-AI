import React, { useEffect, useState } from "react";
import { Search, Download, Share2, Plus, Settings, MessageCircle, FileText, FileBarChart, StickyNote, Paperclip, ListChecks } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AnimeNavBar } from "../ui/anime-navbar";
import { MarkdownRenderer } from "../ui/markdown-renderer";
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
  const [quiz, setQuiz] = useState<any[]>([]);
  const [summaryBullets, setSummaryBullets] = useState<string[]>([]);
  const [notesMarkdown, setNotesMarkdown] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [selected, setSelected] = useState<Record<number,string>>({});
  const [submitted, setSubmitted] = useState<Record<number,boolean>>({});

  // Navigation items
  const navItems = [
    { name: "Summary", screen: "Summary", icon: FileBarChart },
    { name: "Transcript", screen: "Transcript", icon: FileText },
    { name: "Notes", screen: "Notes", icon: StickyNote },
    { name: "Assets", screen: "Assets", icon: Paperclip },
    { name: "Quiz", screen: "Quiz", icon: ListChecks },
  ];

  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecture.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTabNavigation = (screenName: string) => {
    setActiveTab(screenName);
  };

  // Load data from localStorage whenever lecture changes
  useEffect(() => {
    console.log("Loading data for lecture:", selectedLecture?.title);
    try {
      const raw = localStorage.getItem("lastNotes");
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log("Loaded notes data:", {
          hasSummary: parsed.summary_bullets?.length || 0,
          hasNotes: parsed.notes_markdown?.length || 0,
          quizCount: parsed.quiz?.length || 0
        });
        setNotesMarkdown(parsed.notes_markdown || "");
        setSummaryBullets(parsed.summary_bullets || []);
        setQuiz(Array.isArray(parsed.quiz) ? parsed.quiz : []);
      } else {
        console.warn("No lastNotes found in localStorage");
      }
    } catch (err) {
      console.error("Error loading notes:", err);
    }
    
    try {
      // Try both keys for transcript
      let transcriptRaw = localStorage.getItem("lastTranscript") || localStorage.getItem("liveTranscript");
      console.log("Loaded transcript length:", transcriptRaw?.length || 0);
      setTranscript(transcriptRaw || "");
    } catch (err) {
      console.error("Error loading transcript:", err);
    }
  }, [selectedLecture]);

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
      
      {/* Left Sidebar */}
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
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <button
          onClick={onChat}
          className="w-14 h-14 rounded-full bg-[#1C1D20] border border-[#2A2C31] text-[#F5F7FA] shadow-lg flex items-center justify-center hover:bg-[#2A2C31] transition-colors"
          title="AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
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
            {/* Summary Tab */}
            {activeTab === "Summary" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div>
                    <h3 className="text-[#F5F7FA] mb-4">Executive Summary</h3>
                    {summaryBullets.length > 0 ? (
                      <ul className="space-y-3 text-[#E5E7EB]">
                        {summaryBullets.map((b, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="text-[#A6A8AD]">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#A6A8AD]">No summary available. Process a recording to generate one.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === "Transcript" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-[#F5F7FA] mb-4">Full Transcript</h3>
                  {transcript ? (
                    <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{transcript}</div>
                  ) : (
                    <p className="text-[#A6A8AD]">No transcript found. Record a lecture to generate one.</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === "Notes" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h3 className="text-[#F5F7FA] mb-4">Structured Notes</h3>
                  {notesMarkdown ? (
                    <MarkdownRenderer content={notesMarkdown} />
                  ) : (
                    <p className="text-[#A6A8AD]">No notes found for this lecture. Process a recording to generate notes.</p>
                  )}
                </div>
              </div>
            )}

            {/* Assets Tab */}
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

            {/* Quiz Tab */}
            {activeTab === "Quiz" && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  {quiz.length === 0 ? (
                    <p className="text-[#A6A8AD]">No quiz found. Generate notes first.</p>
                  ) : (
                    quiz.map((q, idx) => {
                      const entries = Object.entries(q.options || {});
                      const sel = selected[idx];
                      const isSubmitted = submitted[idx];
                      const isCorrect = sel && q.answer && sel.toUpperCase() === q.answer.toUpperCase();
                      return (
                        <div key={idx} className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-4">
                          <div className="text-white mb-3">{idx + 1}. {q.question}</div>
                          <div className="space-y-2">
                            {entries.length > 0 ? (
                              entries.map(([key, val]) => {
                                const chosen = sel === key;
                                const correct = isSubmitted && q.answer && key.toUpperCase() === q.answer.toUpperCase();
                                const wrong = isSubmitted && chosen && !correct;
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setSelected(s => ({...s, [idx]: key}))}
                                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                      chosen ? "border-white/40 bg-white/5" : "border-[#2A2C31] bg-transparent"
                                    } ${correct ? "border-green-500/60" : ""} ${wrong ? "border-red-500/60" : ""}`}
                                  >
                                    <span className="text-[#A6A8AD] mr-2">{key})</span>
                                    <span className="text-white">{val}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <p className="text-[#A6A8AD] text-sm">No options provided.</p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            {!isSubmitted ? (
                              <button onClick={() => setSubmitted(s => ({...s, [idx]: true}))} className="px-3 py-1 rounded-lg bg-white text-black hover:bg-white/90">Submit</button>
                            ) : (
                              <span className={`text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                {isCorrect ? "Correct" : "Incorrect"}
                              </span>
                            )}
                          </div>
                          {isSubmitted && q.explanation && (
                            <div className="mt-3 text-[#A6A8AD] text-sm">Explanation: {q.explanation}</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
