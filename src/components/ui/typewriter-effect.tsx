import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './markdown-renderer';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterEffect({ text, speed = 80, onComplete, className = '' }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Split text into words, preserving spaces and newlines
  const words = text.split(/(\s+)/);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        // Reconstruct text up to current word
        const newText = words.slice(0, currentWordIndex + 1).join('');
        setDisplayedText(newText);
        setCurrentWordIndex(currentWordIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentWordIndex === words.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentWordIndex, words, speed, onComplete, isComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentWordIndex(0);
    setIsComplete(false);
  }, [text]);

  // Render markdown progressively as text types
  return (
    <div className={className}>
      <MarkdownRenderer content={displayedText} />
      {!isComplete && (
        <span className="animate-pulse inline-block ml-1">|</span>
      )}
    </div>
  );
}

