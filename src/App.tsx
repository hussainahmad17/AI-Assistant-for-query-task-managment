import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Chat from "@/pages/Chat";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ChatHistory from "@/pages/ChatHistory";

const router = createBrowserRouter([
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
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
