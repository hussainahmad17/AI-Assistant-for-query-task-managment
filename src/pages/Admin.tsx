
import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAssistant } from "@/contexts/AssistantContext";
import { loadGlobalSettings, saveGlobalSettings, AssistantSettings } from "@/utils/globalSettings";

const Admin = () => {
  const { setApiKey } = useAssistant();
  const { toast } = useToast();
  
  const [assistantName, setAssistantName] = useState("Personal Assistant");
  const [maxContext, setMaxContext] = useState(10);
  const [analyticsCollection, setAnalyticsCollection] = useState(true);
  const [newApiKey, setNewApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-pro");
  const [temperature, setTemperature] = useState(0.7);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("en-US-Standard-B");
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant that provides accurate, concise, and helpful information."
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin Panel - Personal Assistant";
    setIsLoading(true);
    loadGlobalSettings().then((settings) => {
      if (settings) {
        setAssistantName(settings.assistantName ?? "Personal Assistant");
        setMaxContext(settings.maxContext ?? 10);
        setAnalyticsCollection(settings.analyticsCollection ?? true);
        setNewApiKey(settings.apiKey ?? "");
        setModel(settings.model ?? "gemini-1.5-pro");
        setTemperature(settings.temperature ?? 0.7);
        setVoiceEnabled(settings.voiceEnabled ?? true);
        setSelectedVoice(settings.selectedVoice ?? "en-US-Standard-B");
        setSpeechSpeed(settings.speechSpeed ?? 1);
        setSystemPrompt(settings.systemPrompt ?? "You are a helpful AI assistant that provides accurate, concise, and helpful information.");
        setApiKey(settings.apiKey ?? "");
      }
      setIsLoading(false);
    });
  }, []);

  const handleSaveAllSettings = async () => {
    setIsLoading(true);
    const settings: AssistantSettings = {
      assistantName,
      maxContext,
      analyticsCollection,
      apiKey: newApiKey,
      model,
      temperature,
      voiceEnabled,
      selectedVoice,
      speechSpeed,
      systemPrompt,
    };
    const result = await saveGlobalSettings(settings);
    setIsLoading(false);
    if (result) {
      setApiKey(newApiKey.trim());
      window.dispatchEvent(new CustomEvent('settingsUpdate'));
      toast({
        title: "Settings Saved",
        description: "Global assistant settings saved and applied for all users.",
      });
    } else {
      toast({
        title: "Error",
        description: "Error saving global settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="main-content"
      >
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="api">API Configuration</TabsTrigger>
            <TabsTrigger value="voice">Voice Settings</TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="assistant-name">Assistant Name</Label>
                  <Input id="assistant-name" value={assistantName} onChange={e => setAssistantName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-context">Maximum Context Length</Label>
                  <Select value={String(maxContext)} onValueChange={v => setMaxContext(Number(v))}>
                    <SelectTrigger id="max-context">
                      <SelectValue placeholder="Select maximum context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 messages</SelectItem>
                      <SelectItem value="10">10 messages</SelectItem>
                      <SelectItem value="15">15 messages</SelectItem>
                      <SelectItem value="20">20 messages</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Number of previous messages to include for context
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics-switch">Analytics Collection</Label>
                    <p className="text-xs text-muted-foreground">
                      Collect data on queries for analytics dashboard
                    </p>
                  </div>
                  <Switch id="analytics-switch" checked={analyticsCollection} onCheckedChange={setAnalyticsCollection} />
                </div>
                <Button onClick={handleSaveAllSettings} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Gemini API Key</Label>
                  <Input 
                    id="api-key" 
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for the assistant to function. The key is stored globally.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model-select">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model-select">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="temp-slider">Temperature: {temperature.toFixed(1)}</Label>
                  </div>
                  <Slider
                    id="temp-slider"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values produce more predictable responses, higher values more creative ones
                  </p>
                </div>
                <Button onClick={handleSaveAllSettings} disabled={isLoading}>Save API Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voice-enabled">Voice Output Enabled</Label>
                    <p className="text-xs text-muted-foreground">
                      Read responses aloud using text-to-speech
                    </p>
                  </div>
                  <Switch 
                    id="voice-enabled" 
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice</Label>
                  <Select 
                    value={selectedVoice}
                    onValueChange={setSelectedVoice}
                    disabled={!voiceEnabled}
                  >
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US-Standard-B">Male Voice</SelectItem>
                      <SelectItem value="en-US-Standard-C">Female Voice</SelectItem>
                      <SelectItem value="en-US-Standard-D">Male Voice 2</SelectItem>
                      <SelectItem value="en-US-Standard-E">Female Voice 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="speed-slider">Speech Speed</Label>
                  </div>
                  <Slider
                    id="speed-slider"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[speechSpeed]}
                    onValueChange={v => setSpeechSpeed(v[0])}
                    disabled={!voiceEnabled}
                  />
                </div>
                <Button onClick={handleSaveAllSettings} disabled={isLoading || !voiceEnabled}>
                  {isLoading ? "Saving..." : "Save Voice Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Instructions</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={6}
                    placeholder="Instructions for how the AI should behave"
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions guide how the assistant behaves and responds
                  </p>
                </div>
                <Button onClick={handleSaveAllSettings} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Prompt"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
};

export default Admin;
