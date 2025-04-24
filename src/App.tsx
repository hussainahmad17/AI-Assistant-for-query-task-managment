
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider, RequireVerifiedEmail } from "./contexts/AuthContext";
import { AssistantProvider } from "./contexts/AssistantContext";
import { HistoryProvider } from "./contexts/HistoryContext";
import ChatHistory from "@/pages/ChatHistory";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/components/layouts/AuthLayout";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Help from "@/pages/Help";
import VerificationRequired from "@/pages/VerificationRequired";

// Create routes configuration
const routes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/chat",
    element: <RequireVerifiedEmail><Chat /></RequireVerifiedEmail>,
  },
  {
    path: "/chat-history",
    element: <RequireVerifiedEmail><ChatHistory /></RequireVerifiedEmail>,
  },
  {
    path: "/dashboard",
    element: <RequireVerifiedEmail><Dashboard /></RequireVerifiedEmail>,
  },
  {
    path: "/admin",
    element: <RequireVerifiedEmail><Admin /></RequireVerifiedEmail>,
  },
  {
    path: "/profile",
    element: <RequireVerifiedEmail><Profile /></RequireVerifiedEmail>,
  },
  {
    path: "/help",
    element: <RequireVerifiedEmail><Help /></RequireVerifiedEmail>,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <Auth />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "verification-required",
        element: <VerificationRequired />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AuthProvider>
        <HistoryProvider>
          <AssistantProvider>
            <RouterProvider router={router} />
          </AssistantProvider>
        </HistoryProvider>
      </AuthProvider>
    </>
  );
}

export default App;
