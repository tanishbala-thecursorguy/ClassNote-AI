import { Circle, Square } from "lucide-react";
import { useState, useEffect } from "react";

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, onToggle }: RecordButtonProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onToggle}
        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center transition-all ${
          isRecording
            ? "border-[#DC2626] bg-[#DC2626]/10"
            : "border-[#F5F7FA] bg-transparent hover:bg-[#F5F7FA]/5"
        }`}
      >
        {isRecording ? (
          <Square className="w-10 h-10 text-[#DC2626] fill-current" />
        ) : (
          <Circle className={`w-12 h-12 text-[#F5F7FA] fill-current transition-opacity ${pulse ? 'opacity-70' : 'opacity-100'}`} />
        )}
      </button>
      <p className="text-[#A6A8AD] text-sm">
        {isRecording ? "Tap to stop" : "Tap to record"}
      </p>
    </div>
  );
}
