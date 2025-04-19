import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatResponse } from "@shared/schema";

interface ChatGptResponseProps {
  isLoading: boolean;
  response: ChatResponse | null;
  className?: string;
  onDismiss?: () => void;
}

export function ChatGptResponse({ 
  isLoading, 
  response, 
  className = "",
  onDismiss
}: ChatGptResponseProps) {
  if (!isLoading && !response) return null;

  return (
    <Card className={`chatgpt-response-card border-2 border-primary/10 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
              AI Response
            </Badge>
            <CardTitle className="text-lg">ChatGPT</CardTitle>
          </div>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Dismiss AI response"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
        </div>
        {response?.originalMessage && (
          <CardDescription className="mt-1">
            Responding to: <span className="font-medium italic">{response.originalMessage}</span>
          </CardDescription>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-3">
        <ScrollArea className="h-full max-h-[150px]">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ) : (
            <div className="whitespace-pre-line text-sm">
              {response?.response || "No response available"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}