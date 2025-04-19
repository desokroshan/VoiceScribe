import { 
  users, type User, type InsertUser,
  meetings, type Meeting, type InsertMeeting,
  transcriptions, type Transcription, type InsertTranscription,
  speakers, type Speaker, type InsertSpeaker
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByUserId(userId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meeting: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Transcription operations
  getTranscriptionsByMeetingId(meetingId: number): Promise<Transcription[]>;
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  deleteTranscriptionsByMeetingId(meetingId: number): Promise<boolean>;
  
  // Speaker operations
  getSpeakersByMeetingId(meetingId: number): Promise<Speaker[]>;
  createSpeaker(speaker: InsertSpeaker): Promise<Speaker>;
  deleteSpeakersByMeetingId(meetingId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private transcriptions: Map<number, Transcription>;
  private speakers: Map<number, Speaker>;
  
  private userId: number;
  private meetingId: number;
  private transcriptionId: number;
  private speakerId: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.transcriptions = new Map();
    this.speakers = new Map();
    
    this.userId = 1;
    this.meetingId = 1;
    this.transcriptionId = 1;
    this.speakerId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByUserId(userId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => meeting.userId === userId
    );
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingId++;
    const meeting: Meeting = { ...insertMeeting, id, duration: 0 };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeeting(id: number, meetingUpdate: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...meetingUpdate };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  // Transcription operations
  async getTranscriptionsByMeetingId(meetingId: number): Promise<Transcription[]> {
    return Array.from(this.transcriptions.values()).filter(
      (transcription) => transcription.meetingId === meetingId
    );
  }

  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const id = this.transcriptionId++;
    const transcription: Transcription = { ...insertTranscription, id };
    this.transcriptions.set(id, transcription);
    return transcription;
  }

  async deleteTranscriptionsByMeetingId(meetingId: number): Promise<boolean> {
    let success = true;
    for (const [id, transcription] of this.transcriptions.entries()) {
      if (transcription.meetingId === meetingId) {
        if (!this.transcriptions.delete(id)) {
          success = false;
        }
      }
    }
    return success;
  }

  // Speaker operations
  async getSpeakersByMeetingId(meetingId: number): Promise<Speaker[]> {
    return Array.from(this.speakers.values()).filter(
      (speaker) => speaker.meetingId === meetingId
    );
  }

  async createSpeaker(insertSpeaker: InsertSpeaker): Promise<Speaker> {
    const id = this.speakerId++;
    const speaker: Speaker = { ...insertSpeaker, id };
    this.speakers.set(id, speaker);
    return speaker;
  }

  async deleteSpeakersByMeetingId(meetingId: number): Promise<boolean> {
    let success = true;
    for (const [id, speaker] of this.speakers.entries()) {
      if (speaker.meetingId === meetingId) {
        if (!this.speakers.delete(id)) {
          success = false;
        }
      }
    }
    return success;
  }
}

export const storage = new MemStorage();
