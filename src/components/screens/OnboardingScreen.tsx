import { Mic, FolderOpen, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <Sparkles className="w-16 h-16 text-[#F5F7FA] mx-auto mb-6" />
          <h1 className="text-[#F5F7FA]">Welcome to ClassNote AI</h1>
          <p className="text-[#A6A8AD]">
            Your friend records, AI makes notes for you. Never miss a lecture again.
          </p>
        </div>

        <div className="space-y-6 py-8">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-[#121315] border border-[#2A2C31] flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h3 className="text-[#F5F7FA] mb-1">Microphone Access</h3>
              <p className="text-[#A6A8AD] text-sm">
                Record crystal-clear lectures
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-[#121315] border border-[#2A2C31] flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h3 className="text-[#F5F7FA] mb-1">Storage Access</h3>
              <p className="text-[#A6A8AD] text-sm">
                Save your notes and recordings
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-[#121315] border border-[#2A2C31] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h3 className="text-[#F5F7FA] mb-1">AI-Powered Notes</h3>
              <p className="text-[#A6A8AD] text-sm">
                Automatic summaries, tables, and charts
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full bg-[#F5F7FA] text-[#0B0B0C] hover:bg-[#E5E7EB] h-12 rounded-xl"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
