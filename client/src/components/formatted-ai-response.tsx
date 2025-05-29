import React, { useState, useEffect } from "react";
import { TypewriterEffect } from "./typewriter-effect";

interface FormattedAIResponseProps {
  content: string;
}

export function FormattedAIResponse({ content }: FormattedAIResponseProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>([]);

  // Process the content into formatted elements
  useEffect(() => {
    const processContent = (text: string) => {
      const lines = text.split(/\n+/);
      const formatted: React.ReactNode[] = [];
      let currentList: string[] = [];
      let isInCodeBlock = false;
      let codeContent = '';
      
      lines.forEach((line, idx) => {
        // Code block handling
        if (line.startsWith('```')) {
          if (isInCodeBlock) {
            formatted.push(
              <pre key={`code-${idx}`} className="relative bg-muted/50 p-4 rounded-lg my-3">
                <code className="block text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                  {codeContent}
                </code>
              </pre>
            );
            isInCodeBlock = false;
            codeContent = '';
          } else {
            isInCodeBlock = true;
          }
          return;
        }

        if (isInCodeBlock) {
          codeContent += line + '\n';
          return;
        }

        // List item handling
        if (line.startsWith('- ')) {
          currentList.push(line.slice(2));
          return;
        }

        // If we were building a list and hit a non-list item, add the list
        if (currentList.length > 0) {
          formatted.push(
            <ul key={`list-${idx}`} className="my-3 space-y-1">
              {currentList.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2 mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/20" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }

        // Inline formatting
        const formattedLine = line
          // Bold
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // Inline code
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm">$1</code>');

        if (formattedLine.trim()) {
          formatted.push(
            <p key={idx} className="mb-4 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedLine }} />
          );
        }
      });

      // Handle any remaining list items
      if (currentList.length > 0) {
        formatted.push(
          <ul key="list-end" className="my-3 space-y-1">
            {currentList.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/20" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      }

      return formatted;
    };

    setFormattedContent(processContent(content));
  }, [content]);
  return (
    <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
      {!isComplete ? (
        <TypewriterEffect
          text={content}
          speed={30}
          onComplete={() => setIsComplete(true)}
        />
      ) : (
        <div className="animate-fade-in">
          {formattedContent}
        </div>
      )}
    </div>
  );
}
