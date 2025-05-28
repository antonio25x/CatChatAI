import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Cat, Send, Shield, Clock, Heart, Home, Star, HelpCircle, PawPrint } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelSelector } from "@/components/model-selector";
import { ChatMessage } from "@/components/chat-message";

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  model?: 'openai' | 'gemini';
}

type AIModel = 'openai' | 'gemini';

const suggestedQuestions = [
  {
    icon: HelpCircle,
    category: "Cat Behavior", 
    question: "Why does my cat knead blankets?",
    color: "text-teal-500"
  },
  {
    icon: Heart,
    category: "Cat Health",
    question: "How often should I feed my kitten?",
    color: "text-purple-500"
  },
  {
    icon: Home,
    category: "Cat Care",
    question: "Best litter box setup for multiple cats?",
    color: "text-teal-500"
  },
  {
    icon: Star,
    category: "Cat Breeds",
    question: "What breed is best for apartments?",
    color: "text-purple-500"
  }
];

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const messageDate = new Date(date);
  
  if (now.toDateString() === messageDate.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
         messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageTimestamp = ({ date }: { date: Date }) => (
  <span className="text-xs opacity-50" style={{ color: 'hsl(var(--text-secondary))' }}>
    {formatTimestamp(date)}
  </span>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history
  useEffect(() => {
    async function loadChatHistory() {
      try {
        const response = await fetch('/api/chat/history');
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          setShowWelcome(false);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const askCatExpertMutation = useMutation({
    mutationFn: async ({ question, model }: { question: string; model: AIModel }) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, model }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const messageId = Date.now().toString() + '-ai';
      let fullContent = '';
      
      // Create initial AI message
      const initialMessage: Message = {
        id: messageId,
        content: '',
        type: 'ai',
        timestamp: new Date(),
        model
      };
      setMessages(prev => [...prev, initialMessage]);

      // Process the stream
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') break;

            try {
              const { chunk: textChunk } = JSON.parse(data);
              fullContent += textChunk;
              
              // Update the message content
              setMessages(prev => prev.map(msg => 
                msg.id === messageId
                  ? { ...msg, content: fullContent }
                  : msg
              ));
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      return { response: fullContent, model };
    },
    onSuccess: () => {
      // Success handling is now done in the streaming logic
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        content: "I'm sorry, I'm having trouble connecting right meow. Please try again in a moment! 🐾",
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error asking cat expert:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || askCatExpertMutation.isPending) return;

    // Hide welcome section when first message is sent
    if (showWelcome) {
      setShowWelcome(false);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    askCatExpertMutation.mutate({question: inputValue, model: selectedModel});
    setInputValue("");
  };

  const handleSuggestedClick = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as AIModel);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-end gap-3 p-4 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          <PawPrint className="text-teal-500" size={16} />
          <span>Online</span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your chat history?')) {
                setMessages([]);
                setShowWelcome(true);
                fetch('/api/chat/clear', { method: 'POST' });
              }
            }}
          >
            Clear History
          </Button>
        )}
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="px-2 py-1 rounded border text-sm bg-background border-gray-300 focus:outline-none"
          style={{ color: 'hsl(var(--text-primary))' }}
        >
          <option value="openai">ChatGPT</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {/* Welcome Section */}
        {showWelcome && (
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full flex flex-col justify-center items-center text-center p-4">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Welcome to <span className="gradient-text">CatGPT</span>
                </h2>
                <p className="text-lg md:text-xl max-w-2xl" style={{ color: 'hsl(var(--text-secondary))' }}>
                  Get expert advice on cat behavior, health, nutrition, and more from our AI-powered feline specialist.
                </p>
              </div>
            </div>
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
              {suggestedQuestions.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer transition-all duration-200 hover:scale-105 group border"
                    style={{ 
                      backgroundColor: 'hsl(var(--dark-secondary))',
                      borderColor: 'hsl(var(--dark-tertiary))',
                    }}
                    onClick={() => handleSuggestedClick(item.question)}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent 
                        className={`mt-1 group-hover:scale-110 transition-transform ${item.color}`} 
                        size={20} 
                      />
                      <div>
                        <h3 className="font-medium text-sm mb-1" style={{ color: 'hsl(var(--text-primary))' }}>
                          {item.category}
                        </h3>
                        <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
                          {item.question}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {!showWelcome && (
          <div className="absolute inset-0 flex flex-col">
            {isLoadingHistory ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="flex items-center space-x-2">
                  <div className="animate-paw-tap">
                    <PawPrint className="text-teal-500" size={24} />
                  </div>
                  <span style={{ color: 'hsl(var(--text-secondary))' }}>Loading your chat history...</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}

                {/* Loading Indicator */}
                {askCatExpertMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="chat-bubble-ai p-4 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <div className="animate-paw-tap">
                          <PawPrint className="text-teal-500" size={16} />
                        </div>
                        <span style={{ color: 'hsl(var(--text-secondary))' }}>The cat is thinking</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 rounded-full animate-bounce bg-teal-500"></div>
                          <div className="w-1 h-1 rounded-full animate-bounce animate-bounce-delay-200 bg-teal-500"></div>
                          <div className="w-1 h-1 rounded-full animate-bounce animate-bounce-delay-400 bg-teal-500"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Input Section */}
        <div className="p-4 backdrop-blur-md border-t border-border"
             style={{ backgroundColor: 'hsla(var(--dark-bg), 0.9)' }}>
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything about cats..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={askCatExpertMutation.isPending}
                className="pr-12 input-glow transition-all duration-200"
                style={{
                  backgroundColor: 'hsl(var(--dark-secondary))',
                  borderColor: 'hsl(var(--dark-tertiary))',
                  color: 'hsl(var(--text-primary))'
                }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || askCatExpertMutation.isPending}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg hover:scale-105 transition-transform duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))',
                  border: 'none'
                }}
              >
                <Send className="text-white" size={14} />
              </Button>
            </div>
          </form>
          
          <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Shield className="text-teal-500" size={12} />
                <span>AI-powered responses</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="text-purple-500" size={12} />
                <span>~2 sec response time</span>
              </span>
            </div>
            <span>Press Enter to send</span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Replace FormattedGeminiResponse with a model-agnostic FormattedAIResponse:
import React from "react";

function FormattedAIResponse({ content }: { content: string }) {
  // Basic Markdown to React elements (safe subset)
  // Bold: **text**
  // Italic: *text*
  // Inline code: `code`
  // Lists: - item
  // Newlines: <br />
  const lines = content.split(/\n+/).map((line, idx) => {
    // List item
    if (/^- /.test(line)) {
      return <li key={idx}>{line.replace(/^- /, "")}</li>;
    }
    // Bold
    let el = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      // Italic
      .replace(/\*(.*?)\*/g, (_, m) => `<em>${m}</em>`)
      // Inline code
      .replace(/`([^`]+)`/g, (_, m) => `<code>${m}</code>`);
    return <span key={idx} dangerouslySetInnerHTML={{ __html: el }} />;
  });
  // Group list items
  const grouped: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (React.isValidElement(line) && line.type === 'li') {
      list.push(line);
    } else {
      if (list.length) {
        grouped.push(<ul key={`ul-${idx}`}>{list}</ul>);
        list = [];
      }
      grouped.push(line);
      grouped.push(<br key={`br-${idx}`} />);
    }
  });
  if (list.length) grouped.push(<ul key="ul-end">{list}</ul>);
  return <div className="prose prose-sm prose-invert max-w-none" style={{ color: 'hsl(var(--text-primary))' }}>{grouped}</div>;
}
