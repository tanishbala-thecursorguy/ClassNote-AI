import React from "react";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { AnimatedAIChat } from "../ui/animated-ai-chat";

interface ChatScreenProps {
  onBack: () => void;
}

export function ChatScreen({ onBack }: ChatScreenProps) {
  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-white hover:bg-gray-800"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
      </div>
      
      {/* Chat Interface */}
      <div className="flex-1">
        <AnimatedAIChat />
      </div>
    </div>
  );
}
