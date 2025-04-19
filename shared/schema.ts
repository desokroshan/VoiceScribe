import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define AI response schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  prompt: z.string().optional(),
});

export const chatResponseSchema = z.object({
  response: z.string().nullable(),
  isQuestion: z.boolean(),
  originalMessage: z.string().optional(),
  message: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Meeting model for storing meeting information
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"),
  summary: text("summary"),
  keyPoints: text("key_points"),
  actionItems: text("action_items"),
});

// Create a custom Zod schema for the meeting with proper date handling
export const insertMeetingSchema = z.object({
  name: z.string(),
  userId: z.number(),
  date: z.union([
    z.date(),
    z.string().transform(str => new Date(str))
  ])
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// Transcription model for storing meeting transcriptions
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  speaker: text("speaker"),
  content: text("content").notNull(),
});

// Create a custom Zod schema for transcriptions with proper date handling
export const insertTranscriptionSchema = z.object({
  meetingId: z.number(),
  timestamp: z.union([
    z.date(),
    z.string().transform(str => new Date(str))
  ]),
  speaker: z.string().nullable(), // Allow null for speaker
  content: z.string()
});

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Transcription = typeof transcriptions.$inferSelect;

// Speaker model for identifying speakers in meetings
export const speakers = pgTable("speakers", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  color: text("color").notNull(),
});

export const insertSpeakerSchema = createInsertSchema(speakers).pick({
  meetingId: true,
  name: true,
  initials: true,
  color: true,
});

export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type Speaker = typeof speakers.$inferSelect;
