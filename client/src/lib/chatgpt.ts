import { apiRequest } from "./queryClient";
import { ChatRequest, ChatResponse } from "@shared/schema";

/**
 * Sends a message to the ChatGPT API and returns the response
 * @param message - The message to send to ChatGPT
 * @param customPrompt - Optional custom system prompt to override the default
 * @returns The ChatGPT response
 */
export async function sendMessageToChatGpt(
  message: string,
  customPrompt?: string
): Promise<ChatResponse> {
  try {
    const requestData: ChatRequest = {
      message,
      prompt: customPrompt,
    };

    // Making a direct fetch request to avoid type issues with apiRequest
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json() as ChatResponse;
  } catch (error) {
    console.error("Error sending message to ChatGPT:", error);
    return {
      response: "Error communicating with ChatGPT. Please try again later.",
      isQuestion: true,
      originalMessage: message,
    };
  }
}

/**
 * Determines if a message is likely a question
 * @param message - The message to check
 * @returns True if the message is likely a question, false otherwise
 */
export function isLikelyQuestion(message: string): boolean {
  const trimmedMessage = message.trim();
  
  // Check for question marks
  if (trimmedMessage.endsWith('?')) {
    return true;
  }
  
  // Check for common question words/phrases
  const questionPhrases = [
    'what', 'why', 'how', 'when', 'where', 'who', 'which', 
    'can you', 'could you', 'would you', 'will you', 
    'is there', 'are there', 'do you know'
  ];
  
  const lowerMessage = trimmedMessage.toLowerCase();
  return questionPhrases.some(phrase => 
    lowerMessage.startsWith(phrase + ' ') || 
    lowerMessage.includes(' ' + phrase + ' ')
  );
}