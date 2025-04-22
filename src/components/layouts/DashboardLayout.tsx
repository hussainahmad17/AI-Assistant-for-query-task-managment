
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, BarChart, Settings, MessageSquare, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/chat", icon: <MessageSquare size={20} />, label: "Assistant" },
    { path: "/chat-history", icon: <History size={20} />, label: "Chat History" },
    { path: "/dashboard", icon: <BarChart size={20} />, label: "Analytics" },
    { path: "/admin", icon: <Settings size={20} />, label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-gradient">Personal Assistant</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block w-64 border-r h-screen sticky top-0 bg-card">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-xl text-gradient">Personal Assistant</span>
            </Link>
          </div>
          <nav className="p-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="mt-auto pt-4 border-t my-4">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-background border-r w-64 lg:hidden"
          >
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl text-gradient">Personal Assistant</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
            </div>
            <nav className="p-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="mt-auto pt-4 border-t my-4">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Log Out</span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
