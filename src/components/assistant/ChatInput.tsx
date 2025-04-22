
import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { useAssistant } from "@/contexts/AssistantContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useToast } from "@/hooks/use-toast";

export const ChatInput = () => {
  const [input, setInput] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean | null>(null);
  const { isProcessing, sendMessage, isListening, toggleListening } = useAssistant();
  const { addToHistory } = useHistory();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const isSpeechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    setIsSpeechSupported(isSpeechRecognitionSupported);
    
    if (!isSpeechRecognitionSupported) {
      console.log("Speech recognition is not supported in this browser");
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;
    
    const message = input.trim();
    setInput("");
    
    // Send the message to the assistant context
    await sendMessage(message);
  };

  // Focus the textarea when not listening
  useEffect(() => {
    if (!isListening && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isListening]);

  // Auto-resize the textarea as content grows
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleVoiceToggle = () => {
    if (!isSpeechSupported && !isListening) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser does not support speech recognition. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }
    
    toggleListening();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg bg-card overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Textarea
          ref={textareaRef}
          placeholder={isListening ? "Listening to your voice..." : "Ask me anything..."}
          value={input}
          onChange={handleTextareaChange}
          className={`min-h-[60px] border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200 ${isListening ? 'bg-muted' : ''}`}
          disabled={isListening || isProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <div className="flex items-center justify-between p-3 border-t">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : isSpeechSupported ? "secondary" : "outline"}
              onClick={handleVoiceToggle}
              className="rounded-full relative"
              disabled={isProcessing}
            >
              {!isSpeechSupported && !isListening && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isListening ? "listening" : "not-listening"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
          
          <AnimatePresence>
            {isListening && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-primary font-medium flex items-center gap-2"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Listening...
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              disabled={(!input.trim() && !isListening) || isProcessing}
              className="rounded-full"
            >
              {isProcessing ? (
                <Loader2 size={18} className="mr-2 animate-spin" />
              ) : (
                <Send size={18} className="mr-2" />
              )}
              {isProcessing ? "Processing..." : "Send"}
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
