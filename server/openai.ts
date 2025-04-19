import OpenAI from "openai";
import { z } from "zod";

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for ChatGPT request
export const chatGptRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  prompt: z.string().optional(),
});

export type ChatGptRequest = z.infer<typeof chatGptRequestSchema>;

// Default system prompt
const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant helping with questions during a meeting. 
Provide concise, helpful answers to questions. If you're not sure about something, be honest about your limitations.
Try to keep your responses brief and to the point, as this is being used during a live meeting.`;

/**
 * Send a message to ChatGPT and get a response
 * @param message - The message to send to ChatGPT
 * @param customPrompt - Optional custom system prompt to override the default
 * @returns The ChatGPT response
 */
export async function getChatGptResponse(message: string, customPrompt?: string): Promise<string> {
  try {
    const systemPrompt = customPrompt || DEFAULT_SYSTEM_PROMPT;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "No response from ChatGPT";
  } catch (error: any) {
    console.error("Error calling ChatGPT API:", error);
    
    // Handle specific OpenAI error types
    if (error.code === 'insufficient_quota') {
      return "OpenAI API quota exceeded. Please check your API key or billing details.";
    } else if (error.status === 429) {
      return "Rate limit exceeded. Please try again in a few moments.";
    } else if (error.code === 'invalid_api_key') {
      return "Invalid API key. Please check your OpenAI API key configuration.";
    }
    
    return "Error getting response from ChatGPT. Please try again later.";
  }
}