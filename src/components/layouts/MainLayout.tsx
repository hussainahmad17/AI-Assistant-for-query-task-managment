
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  History, 
  LogOut, 
  MessageSquare, 
  Settings, 
  User, 
  HelpCircle,
  Home,
  Menu,
  ChevronLeft
} from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Ensure hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", icon: <Home className="size-4" />, label: "Home", ariaLabel: "Go to home page" },
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
                className="flex items-center gap-2"
                aria-label="Go to homepage"
              >
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-xl">Personal Assistant</span>
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
                          className="flex items-center gap-3"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          {item.path === "/admin" && (
                            <Badge variant="outline" className="ml-auto py-0 h-5 text-xs">Admin</Badge>
                          )}
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
                      <Link to="/profile" aria-label="Go to profile" className="flex items-center gap-3">
                        <User className="size-4" />
                        <span>Profile</span>
                        {user && (
                          <div className="ml-auto w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                              <img 
                                src={user.user_metadata.avatar_url} 
                                alt={user.email} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-primary">
                                {(user.email?.charAt(0) || "U").toUpperCase()}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Help">
                      <Link to="/help" aria-label="Get help" className="flex items-center gap-3">
                        <HelpCircle className="size-4" />
                        <span>Help & Support</span>
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
                <SidebarMenuButton 
                  tooltip="Log out"
                  onClick={handleSignOut}
                  className="text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <div className="flex-1">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
              <div className="flex h-16 items-center gap-4 px-4">
                <SidebarTrigger className="lg:hidden" />
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <nav className="hidden md:flex items-center space-x-2">
                    <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <li>
                        <Link 
                          to="/" 
                          className="hover:text-foreground"
                          aria-label="Go to home page"
                        >
                          Home
                        </Link>
                      </li>
                      <li>/</li>
                      <li className="font-medium text-foreground">
                        {navItems.find(item => isActive(item.path))?.label || 
                         (location.pathname === "/profile" ? "Profile" : "Page")}
                      </li>
                    </ol>
                  </nav>
                </div>
                
                <div className="ml-auto flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/profile">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label="View profile"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Profile</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </header>
            
            <main className="p-4 md:p-6">
              {children}
            </main>
            
            <footer className="border-t p-4 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Personal Assistant. All rights reserved.</p>
            </footer>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
