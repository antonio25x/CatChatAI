import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Sparkles } from "lucide-react";

type AIModel = "openai" | "gemini";

interface ModelSelectorProps {
  value: AIModel;
  onValueChange: (value: AIModel) => void;
}

export function ModelSelector({ value, onValueChange }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-40 h-8 text-xs border-none focus:ring-0 focus:ring-offset-0" 
                     style={{ 
                       backgroundColor: 'hsl(var(--muted))', 
                       color: 'hsl(var(--foreground))' 
                     }}>
        <div className="flex items-center space-x-2">
          {value === "openai" ? (
            <Bot className="text-teal-500" size={14} />
          ) : (
            <Sparkles className="text-purple-500" size={14} />
          )}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent style={{ backgroundColor: 'hsl(var(--card))' }}>
        <SelectItem value="openai" className="text-xs">
          <div className="flex items-center space-x-2">
            <Bot className="text-teal-500" size={14} />
            <span>ChatGPT</span>
          </div>
        </SelectItem>
        <SelectItem value="gemini" className="text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-purple-500" size={14} />
            <span>Gemini</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}