import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Hash location hook for GitHub Pages
const useHashLocation = () => {
  const getHashPath = () => {
    const hash = window.location.hash;
    // If the hash starts with #/ (e.g. #/admin), treat it as a route.
    // Otherwise (e.g. #contact, or empty), treat it as the root path /.
    return hash.startsWith("#/") ? hash.replace(/^#/, "") : "/";
  };

  const [loc, setLoc] = useState(getHashPath());

  useEffect(() => {
    const handler = () => setLoc(getHashPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminLogin} />
      {/* Admin routes might not fully work without backend, but keeping for structure */}
      <Route path="/admin/dashboard/:rest*" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WouterRouter hook={useHashLocation}>
          <AppRoutes />
        </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
