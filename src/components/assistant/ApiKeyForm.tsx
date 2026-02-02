
import { useState, useEffect } from "react";
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
  
  // Use a working test API key
  const TEST_API_KEY = "AIzaSyDpX7eoKGtN7nU5TcjnRfr0fPkUtaJNPFY";

  // Load API key from localStorage if available
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      console.log("Found saved API key");
      setApiKey(savedApiKey);
    } else {
      // Set default API key for testing
      setApiKeyInput(TEST_API_KEY);
    }
  }, [setApiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKeyInput.trim()) {
      setError("Please enter an API key");
      return;
    }
    
    console.log("Validating API key:", apiKeyInput.substring(0, 10) + "...");
    setIsValidating(true);
    setError("");
    
    try {
      // Test the API key with a simple request
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKeyInput.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Hello' }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 10,
          }
        }),
      });
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        throw new Error(errorData.error?.message || "Invalid API key");
      }
      
      console.log("API key validation successful");
      setApiKey(apiKeyInput.trim());
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
    } catch (err: any) {
      console.error("API key validation failed:", err);
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
            A test key is pre-filled for demonstration purposes.
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
                placeholder="Enter your Gemini API key"
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
