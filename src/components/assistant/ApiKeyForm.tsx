
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssistant } from "@/contexts/AssistantContext";
import { useToast } from "@/hooks/use-toast";

export const ApiKeyForm = () => {
  const { apiKey, setApiKey } = useAssistant();
  const { toast } = useToast();
  const [keyInput, setKeyInput] = useState(apiKey || "");

  // Set the default Gemini API key on component mount
  useEffect(() => {
    const defaultApiKey = "AIzaSyBs1XjJlKnUUJDNHbNxT17WJxXOMdhWO5M";
    if (!apiKey) {
      setApiKey(defaultApiKey);
      setKeyInput(defaultApiKey);
      toast({
        title: "API Key Set",
        description: "Default Gemini API key has been set automatically.",
      });
    }
  }, [apiKey, setApiKey, toast]);

  const saveApiKey = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border rounded-lg p-4 mb-6"
    >
      <h3 className="text-lg font-medium mb-2">Gemini API Key</h3>
      <p className="text-muted-foreground text-sm mb-4">
        To use this assistant, please provide your Gemini API Key.
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="Enter your Gemini API Key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={saveApiKey}>Save Key</Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Your API key is stored locally on your device.
      </p>
    </motion.div>
  );
};
