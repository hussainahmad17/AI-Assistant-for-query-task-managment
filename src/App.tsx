
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import { AssistantProvider } from "./contexts/AssistantContext";
import { HistoryProvider } from "./contexts/HistoryContext";
import ChatHistory from "@/pages/ChatHistory";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/components/layouts/AuthLayout";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Help from "@/pages/Help";

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
    element: <Chat />,
  },
  {
    path: "/chat-history",
    element: <ChatHistory />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
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
