
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useAssistant } from "@/contexts/AssistantContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLastMessage?: boolean;
}

export const ChatMessage = ({ 
  content, 
  role, 
  timestamp, 
  isLastMessage 
}: ChatMessageProps) => {
  const { isSpeaking, stopSpeaking, speakMessage } = useAssistant();
  
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
            ? 'bg-card border text-card-foreground shadow-sm' 
            : 'bg-primary text-primary-foreground'
        }`}>
          {isAssistant ? (
            <div className="prose prose-sm max-w-none dark:prose-invert break-words">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
          
          {isAssistant && isLastMessage && (
            <div className="flex justify-end mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => isSpeaking ? stopSpeaking() : speakMessage(content)}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isSpeaking ? 'Stop speaking' : 'Read aloud'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
