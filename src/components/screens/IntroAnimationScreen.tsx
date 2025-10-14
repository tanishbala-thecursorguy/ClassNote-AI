import React, { useState } from "react";
import VaporizeTextCycle, { Tag } from "../ui/vapour-text-effect";

interface IntroAnimationScreenProps {
  onComplete: () => void;
}

export function IntroAnimationScreen({ onComplete }: IntroAnimationScreenProps) {
  const [isComplete, setIsComplete] = useState(false);

  const handleAnimationComplete = () => {
    setIsComplete(true);
    // Wait a moment before transitioning
    setTimeout(() => {
      console.log('Intro animation completed - going to Get Started screen');
      onComplete();
    }, 500); // Reduced from 1000ms to 500ms
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center relative overflow-hidden">
      {/* Background gradient for extra visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
      
      {/* Main vapor text effect */}
      <div className="relative z-10 w-full h-full flex justify-center items-center">
        <VaporizeTextCycle
          texts={["ClassNotes AI", "Is", "Cool"]}
          font={{
            fontFamily: "Inter, sans-serif",
            fontSize: "70px",
            fontWeight: 600
          }}
          color="rgb(255, 255, 255)"
          spread={5}
          density={5}
          animation={{
            vaporizeDuration: 2,
            fadeInDuration: 1,
            waitDuration: 0.5
          }}
          direction="left-to-right"
          alignment="center"
          tag={Tag.H1}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>

      {/* Subtle loading indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Optional: Skip button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          Skip Animation
        </button>
      )}
    </div>
  );
}