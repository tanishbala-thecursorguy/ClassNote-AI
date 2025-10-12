import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  htmlContent: string; // Accepts HTML string for rich text
  delay?: number;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  htmlContent,
  delay = 0,
  speed = 50,
  onComplete,
  className,
}) => {
  const [displayedHtml, setDisplayedHtml] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < htmlContent.length) {
        setDisplayedHtml(htmlContent.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete?.();
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, htmlContent, speed, onComplete]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: displayedHtml }} />;
};

export default TypewriterText;
