import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/main-layout";
import HomePage from "@/pages/home";
import ChatPage from "@/pages/chat";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/chat" component={ChatPage} />
        <Route component={HomePage} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="catgpt-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
