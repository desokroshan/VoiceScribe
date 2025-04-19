// This is a simplified implementation of speech transcription
// In a real application, this would connect to a server with a proper speech recognition API

interface TranscriptionResult {
  speaker?: string;
  content: string;
  confidence?: number; // 0-1
}

type TranscriptionCallback = (result: TranscriptionResult) => void;

// Mock data for simulating transcription
const mockSpeakers = ["John Smith", "Alex Kim", "Sarah Jones"];
const mockTranscriptions = [
  "Welcome everyone to our weekly marketing meeting. Today we'll be discussing the Q3 campaign results and planning for Q4.",
  "Thanks John. I've prepared the analytics report. Our social media campaign exceeded expectations with a 24% increase in engagement compared to Q2.",
  "That's great news! The email campaign also performed well with an open rate of 32%, which is 5 points above industry average. I think we should continue with a similar approach for Q4.",
  "I agree. For Q4, we need to focus on the holiday season campaign. I propose we start planning next week and have a draft ready by the end of the month.",
  "Sounds good. I'll prepare some initial ideas for the holiday campaign based on last year's success."
];

// WebSpeech API implementation
let recognition: SpeechRecognition | null = null;

/**
 * Start speech recognition and transcription
 * @param stream Audio stream to transcribe
 * @param enableSpeakerIdentification Whether to attempt to identify speakers
 * @param callback Function to call with transcription results
 */
export function transcribeSpeech(
  stream: MediaStream,
  enableSpeakerIdentification: boolean,
  callback: TranscriptionCallback
): void {
  // Check if browser supports SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported in this browser. Using mock data.");
    useMockTranscription(enableSpeakerIdentification, callback);
    return;
  }
  
  try {
    // Initialize speech recognition
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Set up recognition handlers
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      // Only provide final results to callback
      if (result.isFinal) {
        const speaker = enableSpeakerIdentification 
          ? assignSpeaker(transcript)
          : undefined;
        
        callback({
          speaker,
          content: transcript,
          confidence
        });
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Restart recognition on error
      if (recognition) {
        recognition.stop();
        setTimeout(() => {
          if (recognition) recognition.start();
        }, 1000);
      }
    };
    
    recognition.start();
    
    // If we have an audio stream, we could theoretically connect it directly
    // to the recognition engine, but browser APIs don't currently support this well.
    // In a real implementation, we would use a server-side API to process the audio stream.
    
  } catch (error) {
    console.error('Failed to initialize speech recognition:', error);
    useMockTranscription(enableSpeakerIdentification, callback);
  }
}

/**
 * Stop speech recognition
 */
export function stopTranscription(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

/**
 * Fallback function to use mock data for demonstration
 */
function useMockTranscription(
  enableSpeakerIdentification: boolean,
  callback: TranscriptionCallback
): void {
  let index = 0;
  
  // Simulate real-time transcription with delays
  const interval = setInterval(() => {
    if (index >= mockTranscriptions.length) {
      clearInterval(interval);
      return;
    }
    
    const transcript = mockTranscriptions[index];
    const speaker = enableSpeakerIdentification 
      ? mockSpeakers[index % mockSpeakers.length]
      : undefined;
    
    callback({
      speaker,
      content: transcript,
      confidence: 0.9
    });
    
    index++;
  }, 5000); // Add a transcript every 5 seconds
}

/**
 * Simple algorithm to assign a speaker based on the content
 * In a real implementation, this would use a much more sophisticated speaker diarization system
 */
function assignSpeaker(transcript: string): string {
  // Very simplified mock implementation - in reality would use voiceprints/ML
  const firstWord = transcript.split(' ')[0].toLowerCase();
  
  if (firstWord === 'thanks' || firstWord === "i'll") {
    return mockSpeakers[1]; // Alex
  } else if (firstWord === "that's" || firstWord === "sounds") {
    return mockSpeakers[2]; // Sarah
  } else {
    return mockSpeakers[0]; // John (default)
  }
}
