
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Chat from "./pages/Chat";

// Auth
import AuthLayout from "./components/layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Context
import { AssistantProvider } from "./contexts/AssistantContext";
import { HistoryProvider } from "./contexts/HistoryContext";

const queryClient = new QueryClient();

const App = () => {
  // Remove the useEffect that was causing issues and log directly
  console.log("App initialized");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AssistantProvider>
          <HistoryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/landing" replace />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/chat" element={<Chat />} />
                
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                </Route>
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </HistoryProvider>
        </AssistantProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
