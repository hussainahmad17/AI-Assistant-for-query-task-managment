
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
import ChatHistory from "@/pages/ChatHistory";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/components/layouts/AuthLayout";

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
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
