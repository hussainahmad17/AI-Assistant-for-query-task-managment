
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TrashIcon, Clock, DownloadIcon, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatHistory = () => {
  const { history, clearHistory } = useHistory();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState(history);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "Chat History - Personal Assistant";
  }, []);

  useEffect(() => {
    // Filter history based on search and active tab
    let filtered = history;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => 
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.response && item.response.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply tab filter
    if (activeTab === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item.timestamp) >= today);
    } else if (activeTab === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.timestamp) >= weekAgo);
    } else if (activeTab === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(item => new Date(item.timestamp) >= monthAgo);
    }
    
    setFilteredHistory(filtered);
  }, [history, searchQuery, activeTab]);

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "History cleared",
      description: "Your chat history has been cleared.",
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const downloadHistory = () => {
    // Create a plain text version for download
    let textContent = "# Chat History Export\n\n";
    
    history.forEach((item, index) => {
      const date = formatDate(item.timestamp);
      textContent += `## Conversation ${index + 1} - ${date}\n\n`;
      textContent += `User: ${item.query}\n\n`;
      textContent += `Assistant: ${item.response || "No response recorded"}\n\n`;
      textContent += "----------\n\n";
    });
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "History downloaded",
      description: "Your chat history has been downloaded as a text file.",
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="main-content"
        className="px-4 md:px-0"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
              <p className="text-muted-foreground mt-1">
                View and search your conversation history
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                onClick={downloadHistory}
                className="flex items-center gap-2"
                aria-label="Download chat history as text file"
                disabled={history.length === 0}
              >
                <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                <span>Export</span>
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearHistory}
                className="flex items-center gap-2"
                aria-label="Clear all chat history"
                disabled={history.length === 0}
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                <span>Clear History</span>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chat history..."
                  className="pl-9"
                  aria-label="Search chat history"
                />
              </div>
              
              <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                <TabsList className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} md:w-[400px]`}>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  {!isMobile && <TabsTrigger value="week">This Week</TabsTrigger>}
                  {!isMobile && <TabsTrigger value="month">This Month</TabsTrigger>}
                </TabsList>
                {isMobile && (
                  <TabsList className="grid grid-cols-2 mt-2">
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                  </TabsList>
                )}
              </Tabs>
            </div>
            
            {filteredHistory.length === 0 ? (
              <Card className="bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center pt-10 pb-10">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-medium">No History Found</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    {history.length === 0 
                      ? "Start a conversation to begin building your chat history."
                      : "No results match your current search or filter."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredHistory.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <CardTitle className="text-base font-medium line-clamp-1">
                            {item.query}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(item.timestamp)}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleExpand(item.id)}
                          aria-label={expandedItems[item.id] ? "Collapse response" : "Expand response"}
                        >
                          {expandedItems[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={expandedItems[item.id] ? "" : "max-h-24 overflow-hidden"}>
                        <div className="prose prose-sm">
                          <p className={expandedItems[item.id] ? "" : "line-clamp-3"}>
                            <strong>Question:</strong> {item.query}
                          </p>
                          <p className={`mt-2 ${expandedItems[item.id] ? "" : "line-clamp-3"}`}>
                            <strong>Response:</strong> {item.response || "No response stored"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ChatHistory;
