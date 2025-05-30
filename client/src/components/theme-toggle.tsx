import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8 px-0 hover:bg-opacity-20 transition-all duration-200"
      style={{
        backgroundColor: theme === "dark" ? "hsla(var(--dark-tertiary), 0.5)" : "hsla(210, 40%, 88%, 0.5)",
        color: theme === "dark" ? "hsl(var(--text-secondary))" : "hsl(210, 40%, 2%)"
      }}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}