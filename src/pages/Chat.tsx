
import { useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { ChatInput } from "@/components/assistant/ChatInput";
import { ApiKeyForm } from "@/components/assistant/ApiKeyForm";
import { useAssistant } from "@/contexts/AssistantContext";
import { Card } from "@/components/ui/card";

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
        <h1 className="text-3xl font-bold mb-6">Personal Assistant</h1>
        
        {!apiKey && <ApiKeyForm />}
        
        <Card className="overflow-hidden border shadow-sm">
          <div className="h-[60vh] p-4 flex flex-col">
            <ChatWindow />
          </div>
          <div className="border-t p-4">
            <ChatInput />
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Chat;
