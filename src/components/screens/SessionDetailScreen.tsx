import { useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { TranscriptRow } from "../classnote/TranscriptRow";
import { ChartBlock } from "../classnote/ChartBlock";
import { TableBlock } from "../classnote/TableBlock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";

interface SessionDetailScreenProps {
  sessionId: string;
  title: string;
  course: string;
  date: string;
  duration: string;
  onBack: () => void;
}

export function SessionDetailScreen({ title, course, date, duration, onBack }: SessionDetailScreenProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    summary: true,
    notes: true,
    tables: true,
    charts: true,
    transcript: false,
  });

  const toggleExportOption = (key: keyof typeof exportOptions) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Mock data
  const transcriptData = [
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
    {
      timestamp: "48:05",
      text: "Remember for the exam: always identify if the problem has optimal substructure before choosing DP.",
      marker: { type: "Exam Tip" as const, color: "#F5F7FA" },
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

  const assignmentTable = {
    headers: ["Date", "Topic", "Reading", "Due"],
    rows: [
      ["Oct 16", "Coin Change Problem", "Chapter 15.1-15.3", "Oct 23"],
      ["Oct 23", "Knapsack Variations", "Chapter 15.4", "Oct 30"],
      ["Oct 30", "Graph Algorithms", "Chapter 22", "Nov 6"],
    ],
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <div className="bg-[#121315] border-b border-[#2A2C31] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#F5F7FA]" />
          </button>
          <div className="flex-1">
            <h2 className="text-[#F5F7FA]">{title}</h2>
            <p className="text-[#A6A8AD] text-sm">{course}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#A6A8AD] text-sm mb-4">
          <span>{date}</span>
          <span>•</span>
          <span>{duration}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowExportDialog(true)}
            className="flex-1 bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB] rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20] rounded-xl"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full bg-[#121315] border-b border-[#2A2C31] rounded-none h-auto p-0">
          <TabsTrigger
            value="summary"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#F5F7FA] rounded-none text-[#A6A8AD] data-[state=active]:text-[#F5F7FA] py-3"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="transcript"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#F5F7FA] rounded-none text-[#A6A8AD] data-[state=active]:text-[#F5F7FA] py-3"
          >
            Transcript
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#F5F7FA] rounded-none text-[#A6A8AD] data-[state=active]:text-[#F5F7FA] py-3"
          >
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#F5F7FA] rounded-none text-[#A6A8AD] data-[state=active]:text-[#F5F7FA] py-3"
          >
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="p-6 space-y-6">
          <div>
            <h3 className="text-[#F5F7FA] mb-3">Executive Summary</h3>
            <p className="text-[#E5E7EB] leading-relaxed">
              This lecture covered two fundamental algorithmic paradigms: greedy algorithms and dynamic programming.
              The session explored when to use each approach, their time complexities, and real-world applications.
              Key examples included Dijkstra's algorithm for greedy and the Fibonacci sequence for DP.
            </p>
          </div>

          <div>
            <h3 className="text-[#F5F7FA] mb-3">Key Takeaways</h3>
            <ul className="space-y-2 text-[#E5E7EB]">
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
        </TabsContent>

        <TabsContent value="transcript" className="p-6">
          <div className="space-y-1">
            {transcriptData.map((item, index) => (
              <TranscriptRow key={index} {...item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="p-6 space-y-6">
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
          <TableBlock title="Upcoming Assignments" {...assignmentTable} />
          <ChartBlock title="Topic Emphasis" data={emphasisData} />
        </TabsContent>

        <TabsContent value="assets" className="p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#121315] border border-[#2A2C31] flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-[#A6A8AD]" />
            </div>
            <h3 className="text-[#F5F7FA] mb-2">No assets yet</h3>
            <p className="text-[#A6A8AD] text-sm">
              Slide photos and attachments will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA]">
          <DialogHeader>
            <DialogTitle className="text-[#F5F7FA]">Export as PDF</DialogTitle>
            <DialogDescription className="text-[#A6A8AD]">
              Choose sections to include
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(exportOptions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={() => toggleExportOption(key as keyof typeof exportOptions)}
                  className="border-[#2A2C31] data-[state=checked]:bg-[#F5F7FA] data-[state=checked]:text-[#0B0B0C]"
                />
                <label htmlFor={key} className="text-[#E5E7EB] capitalize cursor-pointer">
                  {key}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowExportDialog(false)}
              variant="outline"
              className="bg-transparent border-[#2A2C31] text-[#F5F7FA] hover:bg-[#1C1D20]"
            >
              Cancel
            </Button>
            <Button className="bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB]">
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
