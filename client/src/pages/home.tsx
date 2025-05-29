import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Cat, MessageSquare } from "lucide-react";

export default function HomePage() {
  const [_, setLocation] = useLocation();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-3xl">
        <div className="flex justify-center mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))' }}
          >
            <Cat className="text-white" size={40} />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to <span className="gradient-text">CatGPT</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
          Your AI-powered feline companion for expert advice on cat behavior, health, nutrition, and more.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={() => setLocation("/chat")}
            className="text-lg px-8 py-6 rounded-2xl hover:scale-105 transition-transform"
            style={{ 
              background: 'linear-gradient(135deg, hsl(var(--teal-accent)), hsl(var(--purple-accent)))',
              border: 'none'
            }}
          >
            <MessageSquare className="mr-2" />
            Start Chatting
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-card border">
            <h3 className="text-lg font-semibold mb-2">Expert Advice</h3>
            <p className="text-muted-foreground">Get reliable answers to all your cat-related questions from our AI expert.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border">
            <h3 className="text-lg font-semibold mb-2">24/7 Availability</h3>
            <p className="text-muted-foreground">Access cat care insights whenever you need them, day or night.</p>
          </div>
          <div className="p-6 rounded-xl bg-card border">
            <h3 className="text-lg font-semibold mb-2">Personalized Help</h3>
            <p className="text-muted-foreground">Get tailored advice based on your specific cat care situation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
