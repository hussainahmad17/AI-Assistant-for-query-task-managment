
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState } from "react";

// RequireAuth wrapper component
function RequireAuth({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const ADMIN_EMAIL = "hussainahmad.dev.17@gmail.com";
  if (loading) return null; // Or add a loading spinner
  if (!user) return <Navigate to="/auth/login" replace />;
  if (adminOnly && user.email !== ADMIN_EMAIL) return <Navigate to="/chat" replace />;
  return <>{children}</>;
}

const App = () => {
  // Create the query client inside the component
  const [queryClient] = useState(() => new QueryClient());
  
  console.log("App initialized");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AssistantProvider>
            <HistoryProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/landing" replace />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route
                    path="/chat"
                    element={
                      <RequireAuth>
                        <Chat />
                      </RequireAuth>
                    }
                  />
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                  </Route>
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <RequireAuth adminOnly>
                        <Admin />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </HistoryProvider>
          </AssistantProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
