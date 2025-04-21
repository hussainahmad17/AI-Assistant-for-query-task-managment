
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Key, Loader2 } from "lucide-react";
import { useAssistant } from "@/contexts/AssistantContext";

export const ApiKeyForm = () => {
  const { setApiKey } = useAssistant();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  
  const DEFAULT_API_KEY = "YOUR-GEMINI-API-KEY"; // Add a default API key for testing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeyInput.trim()) {
      setError("Please enter an API key");
      return;
    }
    
    setIsValidating(true);
    setError("");
    
    try {
      // Simulate API key validation (replace with actual validation in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if API key format is valid (basic check)
      if (!apiKeyInput.includes("AI") && !apiKeyInput.startsWith("g-") && apiKeyInput !== DEFAULT_API_KEY) {
        throw new Error("Invalid API key format. Gemini API keys typically start with 'AI' or 'g-'");
      }
      
      setApiKey(apiKeyInput.trim());
    } catch (err: any) {
      setError(err.message || "Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </CardTitle>
          <CardDescription>
            Enter your Gemini API key to start using the AI assistant.
            {DEFAULT_API_KEY !== "YOUR-GEMINI-API-KEY" && (
              <span className="block mt-1 text-xs">
                For testing, you can use the pre-filled key.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Input
                type="password"
                placeholder={DEFAULT_API_KEY}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Save API Key"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-4 text-sm text-center text-muted-foreground">
        <p>
          Don't have an API key?{" "}
          <a
            href="https://ai.google.dev/tutorials/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Get one from Google AI
          </a>
        </p>
      </div>
    </motion.div>
  );
};
