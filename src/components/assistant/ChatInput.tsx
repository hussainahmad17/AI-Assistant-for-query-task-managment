
import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send } from "lucide-react";
import { useAssistant } from "@/contexts/AssistantContext";
import { useHistory } from "@/contexts/HistoryContext";

export const ChatInput = () => {
  const [input, setInput] = useState("");
  const { isProcessing, sendMessage, isListening, toggleListening } = useAssistant();
  const { addToHistory } = useHistory();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isProcessing) return;
    
    const message = input.trim();
    setInput("");
    addToHistory(message);
    
    // Send the message to the assistant context
    await sendMessage(message);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg bg-card overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <Textarea
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <div className="flex items-center justify-between p-3 border-t">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "secondary"}
              onClick={toggleListening}
              className="rounded-full"
              disabled={isProcessing}
            >
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
                className="text-sm text-muted-foreground animate-pulse"
              >
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
              disabled={!input.trim() || isProcessing}
              className="rounded-full"
            >
              <Send size={18} className="mr-2" />
              Send
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
