
import { useEffect } from "react";
import { motion } from "framer-motion";
import MainLayout from "@/components/layouts/MainLayout";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { ChatInput } from "@/components/assistant/ChatInput";
import { ApiKeyForm } from "@/components/assistant/ApiKeyForm";
import { useAssistant } from "@/contexts/AssistantContext";
import { Card } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

const Chat = () => {
  const { apiKey, settings } = useAssistant();

  useEffect(() => {
    document.title = `${settings?.assistantName || 'Chat'} - Personal Assistant`;
  }, [settings]);

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
        id="main-content"
      >
        <div className="flex items-center gap-2 mb-6">
          <BrainCircuit className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="text-3xl font-bold tracking-tight">
            {settings?.assistantName || 'Personal Assistant'}
          </h1>
        </div>
        
        {!apiKey && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
            role="region"
            aria-label="API Key Form"
          >
            <ApiKeyForm />
          </motion.div>
        )}
        
        {apiKey && (
          <>
            <Card 
              className="overflow-hidden border shadow-sm"
              role="region"
              aria-label="Chat interface"
            >
              <div className="h-[60vh] p-4 flex flex-col bg-gradient-to-b from-background to-muted/20">
                <ChatWindow />
              </div>
              <div className="border-t p-4 bg-background">
                <ChatInput />
              </div>
            </Card>
            
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>Press Enter to send • Shift+Enter for new line • Click microphone to use voice input</p>
            </div>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Chat;
