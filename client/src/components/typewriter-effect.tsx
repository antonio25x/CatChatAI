import React, { useEffect, useState } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function TypewriterEffect({ text, speed = 20, onComplete }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={currentIndex < text.length ? 'typewriter' : undefined}>
      {displayedText}
    </span>
  );
}
