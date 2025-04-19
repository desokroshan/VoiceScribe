import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertMeetingSchema = createInsertSchema(meetings)
  .pick({
    name: true,
    userId: true,
    date: true,
  })
  .transform((data) => ({
    ...data,
    date: typeof data.date === 'string' ? new Date(data.date) : data.date,
  }));

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

export const insertTranscriptionSchema = createInsertSchema(transcriptions)
  .pick({
    meetingId: true,
    timestamp: true,
    speaker: true,
    content: true,
  })
  .transform((data) => ({
    ...data,
    timestamp: typeof data.timestamp === 'string' ? new Date(data.timestamp) : data.timestamp,
  }));

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
