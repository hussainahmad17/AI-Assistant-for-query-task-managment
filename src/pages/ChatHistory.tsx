
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, MessageSquare, Search, ChevronRight, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  date: Date;
  title: string;
  preview: string;
  messages: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
  }[];
}

const ChatHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load conversation history grouped by day
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use type assertion to bypass TypeScript's type checking
        const { data, error } = await (supabase
          .from('conversation_history') as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group conversations by date (simple approach using date string as key)
        const conversationsByDay = new Map<string, {
          messages: any[];
          date: Date;
        }>();
        
        if (data && data.length > 0) {
          data.forEach((message: any) => {
            const date = new Date(message.created_at);
            const dateKey = date.toDateString(); // Use date string as key
            
            if (!conversationsByDay.has(dateKey)) {
              conversationsByDay.set(dateKey, { 
                messages: [], 
                date: new Date(date.setHours(0, 0, 0, 0))
              });
            }
            
            conversationsByDay.get(dateKey)?.messages.push({
              id: message.id,
              content: message.content,
              role: message.role,
              timestamp: new Date(message.created_at)
            });
          });
          
          // Convert map to array and format the conversations
          const formattedConversations: Conversation[] = Array.from(conversationsByDay.entries())
            .map(([dateKey, { messages, date }]) => {
              // Find first user message in the conversation to use as title
              const firstUserMessage = messages.find((m: any) => m.role === 'user');
              const title = firstUserMessage?.content || "Conversation";
              
              // Create a short preview from the first few messages
              const preview = messages
                .slice(0, 2)
                .map((m: any) => `${m.role === 'user' ? 'You: ' : 'AI: '}${m.content.slice(0, 30)}${m.content.length > 30 ? '...' : ''}`)
                .join(' ');
              
              return {
                id: dateKey,
                date,
                title: title.length > 40 ? title.slice(0, 40) + '...' : title,
                preview,
                messages
              };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first
          
          setConversations(formattedConversations);
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
        toast({
          title: "Error",
          description: "Failed to load your conversation history.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    conv => conv.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteConversation = async (conversation: Conversation) => {
    if (!user) return;

    try {
      // Get IDs of all messages in this conversation
      const messageIds = conversation.messages.map(m => m.id);
      
      // Delete all messages from this conversation
      // Use type assertion to bypass TypeScript's type checking
      await (supabase
        .from('conversation_history') as any)
        .delete()
        .in('id', messageIds);
      
      // Update the UI by removing the deleted conversation
      setConversations(conversations.filter(c => c.id !== conversation.id));
      
      if (selectedConversation?.id === conversation.id) {
        setSelectedConversation(null);
      }
      
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been removed from your history.",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete the conversation.",
        variant: "destructive"
      });
    }
  };

  const continueConversation = () => {
    // Store the selected conversation messages in local storage
    if (selectedConversation) {
      localStorage.setItem('conversation_history', JSON.stringify(selectedConversation.messages));
      navigate('/chat'); // Navigate to the chat page
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Chat History</h1>
            <p className="text-muted-foreground">View and manage your past conversations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversation List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                Search through your past conversations
              </CardDescription>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No matching conversations found" : "No conversations yet"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <div 
                      key={conv.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-accent transition-all ${selectedConversation?.id === conv.id ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{conv.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{conv.preview}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(conv.date, 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card className="md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle>{selectedConversation.title}</CardTitle>
                  <CardDescription>
                    {format(selectedConversation.date, 'MMMM d, yyyy')} • {selectedConversation.messages.length} messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-12' : 'bg-muted mr-12'}`}
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium">
                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                          </span>
                          <span className="text-xs ml-2 opacity-70">
                            {format(message.timestamp, 'h:mm a')}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t p-4">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteConversation(selectedConversation)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={continueConversation}
                  >
                    Continue Chat <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">Select a Conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a conversation from the list to view its contents or search for specific topics.
                </p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ChatHistory;
