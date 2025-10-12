import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  htmlContent: string; // Accepts HTML string for rich text
  delay?: number;
  speed?: number; // milliseconds per character
  pauseTime?: number; // milliseconds to pause before restarting
  onComplete?: () => void;
  className?: string;
  loop?: boolean; // whether to loop continuously
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  htmlContent,
  delay = 0,
  speed = 50,
  pauseTime = 1000,
  onComplete,
  className,
  loop = false,
}) => {
  const [displayedHtml, setDisplayedHtml] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      if (!isDeleting && currentIndex < htmlContent.length) {
        // Typing forward
        setDisplayedHtml(htmlContent.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (!isDeleting && currentIndex >= htmlContent.length) {
        // Finished typing, pause then start deleting (if loop enabled)
        if (loop) {
          setIsPaused(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsPaused(false);
          }, pauseTime);
        } else {
          onComplete?.();
        }
      } else if (isDeleting && currentIndex > 0) {
        // Deleting backward
        setDisplayedHtml(htmlContent.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (isDeleting && currentIndex <= 0) {
        // Finished deleting, pause then start typing again
        setIsPaused(true);
        setTimeout(() => {
          setIsDeleting(false);
          setIsPaused(false);
        }, pauseTime);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, htmlContent, speed, onComplete, isDeleting, isPaused, loop, pauseTime]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: displayedHtml }} />;
};

export default TypewriterText;
