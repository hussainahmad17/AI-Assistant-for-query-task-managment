
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssistant } from "@/contexts/AssistantContext";
import { useToast } from "@/hooks/use-toast";
import { Key, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
});

type FormData = z.infer<typeof formSchema>;

export function ApiKeyForm() {
  const { setApiKey } = useAssistant();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  
  // This creates a pre-filled form with the default value
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "AIzaSyBs1XjJlKnUUJDNHbNxT17WJxXOMdhWO5M", // Pre-filled with the provided key
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Set the API key in the context
      setApiKey(data.apiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <span>Gemini API Key Setup</span>
          </CardTitle>
          <CardDescription>
            Enter your Gemini API key to start using the assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showApiKey ? "text" : "password"} 
                          placeholder="Enter your Gemini API key" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      You can get your API key from the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save API Key</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Your API key is stored locally in your browser and is never sent to our servers.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
