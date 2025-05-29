import React, { useEffect, useState, useRef } from 'react';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  formatter?: (text: string) => string;
}

export function TypewriterEffect({ text, speed = 20, onComplete, formatter }: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousTextLength = useRef(text.length);

  useEffect(() => {
    if (text.length < previousTextLength.current) {
      // Text has been reset, start over
      setDisplayedText('');
      setCurrentIndex(0);
    }
    previousTextLength.current = text.length;
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const nextChar = text[currentIndex];
        setDisplayedText(prev => prev + nextChar);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  const formattedText = formatter ? formatter(displayedText) : displayedText;

  return (
    <span 
      className={currentIndex < text.length ? 'animate-blink-cursor' : undefined}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
}
