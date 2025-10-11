import { Badge } from "../ui/badge";

interface TranscriptRowProps {
  timestamp: string;
  text: string;
  marker?: {
    type: "Key Point" | "Assignment" | "Exam Tip";
    color: string;
  };
}

export function TranscriptRow({ timestamp, text, marker }: TranscriptRowProps) {
  return (
    <div className="flex gap-4 py-3 border-b border-[#2A2C31]/50">
      <div className="text-[#A6A8AD] text-sm min-w-[60px] pt-1">
        {timestamp}
      </div>
      <div className="flex-1">
        {marker && (
          <Badge className="mb-2 bg-[#2A2C31] text-[#F5F7FA] border-0 rounded-lg">
            {marker.type}
          </Badge>
        )}
        <p className="text-[#E5E7EB]">{text}</p>
      </div>
    </div>
  );
}
