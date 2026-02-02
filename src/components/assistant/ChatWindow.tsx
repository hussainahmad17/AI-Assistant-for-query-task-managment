
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAssistant } from "@/contexts/AssistantContext";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const ChatWindow = () => {
  const { messages, clearConversation, isProcessing } = useAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gradient">Conversation</h2>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearConversation}
            className="text-xs"
          >
            <Trash2 size={14} className="mr-1" />
            Clear Chat
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6 p-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Ask me anything!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
              isLastMessage={index === messages.length - 1}
            />
          ))
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </motion.div>
  );
};
