
import { useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { ChatInput } from "@/components/assistant/ChatInput";
import { ApiKeyForm } from "@/components/assistant/ApiKeyForm";
import { useAssistant } from "@/contexts/AssistantContext";
import { Card } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

const Chat = () => {
  const { apiKey } = useAssistant();

  useEffect(() => {
    document.title = "Chat - Personal Assistant";
  }, []);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Personal Assistant</h1>
        </div>
        
        {!apiKey && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ApiKeyForm />
          </motion.div>
        )}
        
        <Card className="overflow-hidden border shadow-sm">
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
      </motion.div>
    </DashboardLayout>
  );
};

export default Chat;
