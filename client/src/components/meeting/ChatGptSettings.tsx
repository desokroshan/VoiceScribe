import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Default system prompt for ChatGPT
const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant helping with questions during a meeting. 
Provide concise, helpful answers to questions. If you're not sure about something, be honest about your limitations.
Try to keep your responses brief and to the point, as this is being used during a live meeting.`;

// Form schema for ChatGPT settings
const chatGptSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  customPrompt: z.string().optional(),
  autoDetectQuestions: z.boolean().default(true),
});

type ChatGptSettings = z.infer<typeof chatGptSettingsSchema>;

interface ChatGptSettingsProps {
  settings: ChatGptSettings;
  onSettingsChange: (settings: ChatGptSettings) => void;
}

export function ChatGptSettings({ settings, onSettingsChange }: ChatGptSettingsProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<ChatGptSettings>({
    resolver: zodResolver(chatGptSettingsSchema),
    defaultValues: settings,
  });

  function onSubmit(data: ChatGptSettings) {
    onSettingsChange(data);
    setOpen(false);
  }

  function resetToDefaults() {
    form.reset({
      enabled: true,
      customPrompt: DEFAULT_SYSTEM_PROMPT,
      autoDetectQuestions: true,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2">
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>ChatGPT Integration Settings</DialogTitle>
          <DialogDescription>
            Configure how ChatGPT responds to questions during your meeting
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Enable ChatGPT Integration</FormLabel>
                    <FormDescription>
                      Process questions using AI during transcription
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoDetectQuestions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-Detect Questions</FormLabel>
                    <FormDescription>
                      Automatically identify questions in transcriptions
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!form.watch("enabled")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="customPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom System Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={DEFAULT_SYSTEM_PROMPT}
                      className="min-h-[120px] resize-y"
                      {...field}
                      value={field.value || ""}
                      disabled={!form.watch("enabled")}
                    />
                  </FormControl>
                  <FormDescription>
                    Customize how ChatGPT should respond to questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}