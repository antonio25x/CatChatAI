import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  Cat,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  History,
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface NavigationSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const navigationItems: NavItem[] = [
  {
    icon: MessageSquare,
    label: "Chat",
    href: "/chat",
  },
  {
    icon: History,
    label: "History",
    href: "/history",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
  {
    icon: HelpCircle,
    label: "Help",
    href: "/help",
  },
];

export function NavigationSidebar({ isExpanded, onToggle }: NavigationSidebarProps) {
  const [location, setLocation] = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-background border-r border-border transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Logo Section */}
      <button 
        onClick={() => setLocation("/")}
        className="p-4 flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))' }}>
          <Cat className="text-white" size={16} />
        </div>
        <span className={cn(
          "font-semibold transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 hidden"
        )}>
          CatGPT
        </span>
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4">
        <TooltipProvider delayDuration={0}>
          {navigationItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full mb-2 justify-start",
                    !isExpanded && "justify-center",
                    location === item.href && "bg-primary/10"
                  )}
                  onClick={() => setLocation(item.href)}
                >
                  <item.icon size={20} className={cn(
                    "min-w-[20px]",
                    isExpanded ? "mr-3" : "mr-0"
                  )} />
                  <span className={cn(
                    "transition-opacity duration-300",
                    isExpanded ? "opacity-100" : "opacity-0 hidden"
                  )}>
                    {item.label}
                  </span>
                </Button>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={onToggle}
        >
          {isExpanded ? (
            <>
              <ChevronLeft size={16} className="mr-2" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight size={16} />
          )}
        </Button>
      </div>
    </div>
  );
}
