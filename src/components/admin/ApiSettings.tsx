
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import React from "react";

interface ApiSettingsProps {
  newApiKey: string;
  setNewApiKey: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  isLoading: boolean;
  onSave: () => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  newApiKey,
  setNewApiKey,
  model,
  setModel,
  temperature,
  setTemperature,
  isLoading,
  onSave,
}) => (
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
      <Button onClick={onSave} disabled={isLoading}>Save API Settings</Button>
    </CardContent>
  </Card>
);

export default ApiSettings;
