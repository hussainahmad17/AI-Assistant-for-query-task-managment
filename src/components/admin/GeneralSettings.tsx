
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React from "react";

interface GeneralSettingsProps {
  assistantName: string;
  setAssistantName: (v: string) => void;
  maxContext: number;
  setMaxContext: (v: number) => void;
  analyticsCollection: boolean;
  setAnalyticsCollection: (v: boolean) => void;
  isLoading: boolean;
  onSave: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  assistantName,
  setAssistantName,
  maxContext,
  setMaxContext,
  analyticsCollection,
  setAnalyticsCollection,
  isLoading,
  onSave,
}) => (
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
      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </CardContent>
  </Card>
);

export default GeneralSettings;
