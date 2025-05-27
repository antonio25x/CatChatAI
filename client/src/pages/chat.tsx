import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Cat, Send, Shield, Clock, Heart, Home, Star, HelpCircle, PawPrint } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelSelector } from "@/components/model-selector";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const response = await apiRequest('POST', '/api/chat', { question, model });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        content: data.response,
        type: 'ai',
        timestamp: new Date(),
        model: data.model
      };
      setMessages(prev => [...prev, aiMessage]);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" 
              style={{ 
                backgroundColor: 'hsla(var(--dark-bg), 0.9)', 
                borderColor: 'hsl(var(--dark-tertiary))' 
              }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))' }}>
              <Cat className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">CatGPT</h1>
              <p className="text-xs" style={{ color: 'hsl(var(--text-secondary))' }}>Your AI Cat Expert</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
              <PawPrint className="text-teal-500" size={16} />
              <span>Online</span>
            </div>
            {/* Model Selector Dropdown */}
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="ml-4 px-2 py-1 rounded border text-sm bg-background border-gray-300 focus:outline-none"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              <option value="openai">ChatGPT</option>
              <option value="gemini">Gemini</option>
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 min-h-screen flex flex-col">
        
        {/* Welcome Section */}
        {showWelcome && (
          <div className="flex-1 flex flex-col justify-center items-center text-center mb-8">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ask the <span className="gradient-text">Cat Expert</span>
              </h2>
              <p className="text-lg md:text-xl max-w-2xl" style={{ color: 'hsl(var(--text-secondary))' }}>
                Get expert advice on cat behavior, health, nutrition, and more from our AI-powered feline specialist.
              </p>
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
          <div className="flex-1 mb-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 max-w-md md:max-w-lg ${
                    message.type === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai'
                  }`}>
                    {message.type === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                             style={{ background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))' }}>
                          <Cat className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="leading-relaxed" style={{ color: 'hsl(var(--text-primary))' }}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
          </div>
        )}

        {/* Input Section */}
        <div className="sticky bottom-0 pt-4 pb-4 backdrop-blur-md"
             style={{ backgroundColor: 'hsla(var(--dark-bg), 0.9)' }}>
          <form onSubmit={handleSubmit} className="flex space-x-3">
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
