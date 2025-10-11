import { Clock, Circle } from "lucide-react";
import { Badge } from "../ui/badge";

export interface LectureCardProps {
  id: string;
  title: string;
  course: string;
  duration: string;
  date: string;
  status: "Recorded" | "Processing" | "Ready" | "Flagged";
  onClick: () => void;
}

export function LectureCard({ title, course, duration, date, status, onClick }: LectureCardProps) {
  const statusColors = {
    Recorded: "bg-[#2A2C31] text-[#A6A8AD]",
    Processing: "bg-[#2A2C31] text-[#E5E7EB]",
    Ready: "bg-[#F5F7FA] text-[#0B0B0C]",
    Flagged: "bg-[#DC2626] text-[#F5F7FA]"
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#121315] border border-[#2A2C31] rounded-2xl p-4 cursor-pointer hover:border-[#F5F7FA]/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-[#F5F7FA] mb-1">{title}</h3>
          <p className="text-[#A6A8AD] text-sm">{course}</p>
        </div>
        <Badge className={`${statusColors[status]} border-0 rounded-lg`}>
          {status}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-[#A6A8AD] text-sm">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-3 h-3 fill-current" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
