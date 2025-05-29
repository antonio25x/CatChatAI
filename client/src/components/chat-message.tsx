import React from 'react';
import { Cat } from 'lucide-react';
import { FormattedAIResponse } from '@/components/formatted-ai-response';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  model?: 'openai' | 'gemini';
}

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);
  
  if (now.toDateString() === messageDate.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
         messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div 
      className={`flex flex-col animate-slide-up ${message.type === 'user' ? 'items-end' : 'items-start'}`}
    >
      <div 
        className={`p-4 max-w-md md:max-w-lg shadow-lg ${
          message.type === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai'
        }`}
      >
        {message.type === 'user' ? (
          <p>{message.content}</p>
        ) : (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))' }}>
              <Cat className="text-white" size={16} />
            </div>
            <div className="flex-1">
              <FormattedAIResponse content={message.content} />
            </div>
          </div>
        )}
      </div>
      <div className="px-4 mt-1">
        <span className="text-xs opacity-50" style={{ color: 'hsl(var(--text-secondary))' }}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};
