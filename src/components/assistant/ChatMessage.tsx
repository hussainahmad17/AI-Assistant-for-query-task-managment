
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAssistant } from "@/contexts/AssistantContext";

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLastMessage?: boolean;
}

export const ChatMessage = ({ content, role, timestamp, isLastMessage }: ChatMessageProps) => {
  const { isSpeaking, stopSpeaking } = useAssistant();
  
  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  const isAssistant = role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
    >
      <Avatar className={`h-8 w-8 ${isAssistant ? 'bg-primary' : 'bg-secondary'}`}>
        <span className="text-white font-medium">
          {isAssistant ? 'AI' : 'You'}
        </span>
      </Avatar>
      
      <div className={`flex flex-col max-w-[80%] space-y-2 ${isAssistant ? '' : 'items-end'}`}>
        <div className={`rounded-lg p-3 ${
          isAssistant 
            ? 'bg-card border text-card-foreground' 
            : 'bg-primary text-primary-foreground'
        }`}>
          <p className="whitespace-pre-wrap">{content}</p>
          
          {isAssistant && isLastMessage && (
            <div className="flex justify-end mt-2">
              <Button 
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={stopSpeaking}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </Button>
            </div>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground">
          {formattedTime}
        </span>
      </div>
    </motion.div>
  );
};
