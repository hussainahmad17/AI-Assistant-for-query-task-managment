
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart, History, LogOut, MessageSquare, Settings, User } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  // Ensure hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/chat", icon: <MessageSquare className="size-4" />, label: "Assistant", ariaLabel: "Chat with assistant" },
    { path: "/chat-history", icon: <History className="size-4" />, label: "Chat History", ariaLabel: "View chat history" },
    { path: "/dashboard", icon: <BarChart className="size-4" />, label: "Analytics", ariaLabel: "View analytics dashboard" },
    { path: "/admin", icon: <Settings className="size-4" />, label: "Settings", ariaLabel: "Manage settings" },
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center p-4">
              <Link 
                to="/" 
                className="flex items-center"
                aria-label="Go to homepage"
              >
                <span className="font-bold text-xl text-gradient">Personal Assistant</span>
              </Link>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.path)}
                        tooltip={item.label}
                      >
                        <Link 
                          to={item.path}
                          aria-label={item.ariaLabel}
                          aria-current={isActive(item.path) ? "page" : undefined}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Profile">
                      <Link to="/profile" aria-label="Go to profile">
                        <User className="size-4" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Log out">
                  <Link 
                    to="/" 
                    className="text-destructive"
                    aria-label="Log out of your account"
                  >
                    <LogOut className="size-4" />
                    <span>Log Out</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-6">
              <SidebarTrigger className="lg:hidden" />
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
