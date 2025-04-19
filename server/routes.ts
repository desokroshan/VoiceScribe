import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema, insertTranscriptionSchema, insertSpeakerSchema } from "@shared/schema";
import { z, ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Meetings API
  app.get("/api/meetings", async (req, res) => {
    try {
      // In a real app, we would use authentication to get the userId
      const userId = 1; // Default user for this demo
      const meetings = await storage.getMeetingsByUserId(userId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      // Handle date conversion explicitly to ensure it's properly processed
      const data = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      
      const meetingData = insertMeetingSchema.parse(data);
      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({ message: "Invalid meeting data", errors: error.errors });
      }
      console.error("Server error:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.patch("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const updatedMeeting = await storage.updateMeeting(id, req.body);
      res.json(updatedMeeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      // Delete related data first
      await storage.deleteTranscriptionsByMeetingId(id);
      await storage.deleteSpeakersByMeetingId(id);
      
      const success = await storage.deleteMeeting(id);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete meeting" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  // Transcriptions API
  app.get("/api/meetings/:meetingId/transcriptions", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const transcriptions = await storage.getTranscriptionsByMeetingId(meetingId);
      res.json(transcriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transcriptions" });
    }
  });

  app.post("/api/meetings/:meetingId/transcriptions", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const transcriptionData = {
        ...req.body,
        meetingId,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
      };
      
      const validatedData = insertTranscriptionSchema.parse(transcriptionData);
      const transcription = await storage.createTranscription(validatedData);
      res.status(201).json(transcription);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid transcription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transcription" });
    }
  });

  // Speakers API
  app.get("/api/meetings/:meetingId/speakers", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const speakers = await storage.getSpeakersByMeetingId(meetingId);
      res.json(speakers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch speakers" });
    }
  });

  app.post("/api/meetings/:meetingId/speakers", async (req, res) => {
    try {
      const meetingId = parseInt(req.params.meetingId);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const speakerData = {
        ...req.body,
        meetingId
      };
      
      const validatedData = insertSpeakerSchema.parse(speakerData);
      const speaker = await storage.createSpeaker(validatedData);
      res.status(201).json(speaker);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid speaker data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create speaker" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
