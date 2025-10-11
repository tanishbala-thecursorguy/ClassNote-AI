import { Search, Plus, Settings, Filter } from "lucide-react";
import { LectureCard, type LectureCardProps } from "../classnote/LectureCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useState } from "react";

interface HomeScreenProps {
  lectures: LectureCardProps[];
  onNewRecording: () => void;
  onSelectLecture: (id: string) => void;
  onSettings: () => void;
}

export function HomeScreen({ lectures, onNewRecording, onSelectLecture, onSettings }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lecture.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterStatus || lecture.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statuses = ["Ready", "Processing", "Recorded", "Flagged"];

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <div className="bg-[#121315] border-b border-[#2A2C31] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#F5F7FA]">My Lectures</h1>
          <button onClick={onSettings} className="p-2 hover:bg-[#2A2C31] rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-[#F5F7FA]" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A6A8AD]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lectures..."
            className="pl-10 bg-[#1C1D20] border-[#2A2C31] text-[#F5F7FA] placeholder:text-[#A6A8AD] h-11 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          <Badge
            onClick={() => setFilterStatus(null)}
            className={`cursor-pointer rounded-lg border-0 ${
              !filterStatus
                ? "bg-[#F5F7FA] text-[#0B0B0C]"
                : "bg-[#2A2C31] text-[#A6A8AD]"
            }`}
          >
            All
          </Badge>
          {statuses.map(status => (
            <Badge
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`cursor-pointer rounded-lg border-0 ${
                filterStatus === status
                  ? "bg-[#F5F7FA] text-[#0B0B0C]"
                  : "bg-[#2A2C31] text-[#A6A8AD]"
              }`}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredLectures.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#121315] border border-[#2A2C31] flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-[#A6A8AD]" />
            </div>
            <h3 className="text-[#F5F7FA] mb-2">
              {searchQuery || filterStatus ? "No lectures found" : "No classes yet"}
            </h3>
            <p className="text-[#A6A8AD] text-sm mb-6">
              {searchQuery || filterStatus
                ? "Try adjusting your search or filters"
                : "Start your first recording"}
            </p>
            {!searchQuery && !filterStatus && (
              <Button
                onClick={onNewRecording}
                className="bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB] rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Recording
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLectures.map(lecture => (
              <LectureCard
                key={lecture.id}
                {...lecture}
                onClick={() => onSelectLecture(lecture.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {lectures.length > 0 && (
        <button
          onClick={onNewRecording}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#F5F7FA] text-[#0B0B0C] shadow-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
