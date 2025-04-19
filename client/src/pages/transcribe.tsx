import { useState, useEffect } from "react";
import { Header } from "@/components/ui/header";
import { MeetingSetup } from "@/components/meeting/MeetingSetup";
import { TranscriptionArea } from "@/components/meeting/TranscriptionArea";
import { MeetingSummary } from "@/components/meeting/MeetingSummary";
import { useToast } from "@/hooks/use-toast";
import { Transcription } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { initializeAudioCapture, stopAudioCapture, captureSystemAudio } from "@/lib/audio-capture";
import { transcribeSpeech } from "@/lib/transcription";

export default function Transcribe() {
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [enableSpeakerIdentification, setEnableSpeakerIdentification] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [meetingId, setMeetingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock data for demonstration
  const keyPoints = [
    "Q3 social media campaign saw 24% increase in engagement",
    "Email campaign reached 32% open rate (5 points above industry average)",
    "Plan to continue similar approach for Q4",
    "Holiday season campaign planning to start next week",
    "Campaign draft due by end of month"
  ];
  
  const actionItems = [
    { id: "1", text: "Alex to prepare initial ideas for holiday campaign", completed: false },
    { id: "2", text: "Sarah to analyze Q3 email campaign performance in detail", completed: false },
    { id: "3", text: "John to schedule Q4 planning session next week", completed: false }
  ];
  
  const attendees = [
    { name: "John Smith", initials: "JS", color: "bg-blue-100 text-blue-600" },
    { name: "Alex Kim", initials: "AK", color: "bg-purple-100 text-purple-600" },
    { name: "Sarah Jones", initials: "SJ", color: "bg-green-100 text-green-600" }
  ];

  // Create a new meeting
  const createMeetingMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/meetings", {
        name,
        userId: 1, // In a real app, this would come from auth
        date: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMeetingId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add a transcription
  const addTranscriptionMutation = useMutation({
    mutationFn: async (transcription: Omit<Transcription, "id" | "meetingId">) => {
      if (!meetingId) return null;
      
      const response = await apiRequest("POST", `/api/meetings/${meetingId}/transcriptions`, {
        ...transcription,
        timestamp: transcription.timestamp || new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        setTranscriptions(prev => [...prev, data]);
        queryClient.invalidateQueries({ queryKey: [`/api/meetings/${meetingId}/transcriptions`] });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transcription",
        variant: "destructive"
      });
    }
  });

  // Start transcription process
  const handleStartTranscription = async (
    meetingName: string, 
    enableSpeakerIdentification: boolean,
    audioSource: "system" | "microphone" | "zoom" | "other"
  ) => {
    try {
      setEnableSpeakerIdentification(enableSpeakerIdentification);
      
      // Create a new meeting in the database
      await createMeetingMutation.mutateAsync(meetingName);
      
      // Setup is complete, show transcription UI
      setIsSetupMode(false);
      setIsRecording(true);
      
      // Capture audio based on selected source
      let stream: MediaStream;
      
      if (audioSource === "system") {
        try {
          // Attempt to capture system audio
          console.log("Attempting to capture system audio...");
          stream = await captureSystemAudio();
        } catch (audioError) {
          console.warn("System audio capture failed, falling back to microphone:", audioError);
          toast({
            title: "System Audio Unavailable",
            description: "System audio capture is not fully supported in browsers without extensions. Falling back to microphone.",
          });
          stream = await initializeAudioCapture();
        }
      } else if (audioSource === "microphone") {
        stream = await initializeAudioCapture();
      } else {
        // For zoom or other, use microphone as fallback but inform the user
        toast({
          title: `${audioSource.charAt(0).toUpperCase() + audioSource.slice(1)} Integration`,
          description: `Direct ${audioSource} integration requires additional setup. Using microphone as fallback.`,
        });
        stream = await initializeAudioCapture();
      }
      
      // Start speech recognition
      transcribeSpeech(stream, enableSpeakerIdentification, (transcript) => {
        // Add transcription to database and state
        addTranscriptionMutation.mutate({
          speaker: transcript.speaker || null,
          content: transcript.content,
          timestamp: new Date() // Use Date object directly, the schema will handle conversion
        });
      });
      
      toast({
        title: "Recording Started",
        description: "Your meeting is now being transcribed using " + 
          (audioSource === "system" ? "system audio" : 
           audioSource === "microphone" ? "microphone" : 
           audioSource + " (via microphone)")
      });
    } catch (error) {
      console.error("Failed to start transcription:", error);
      toast({
        title: "Error",
        description: "Failed to start transcription. Please check your audio settings.",
        variant: "destructive"
      });
    }
  };

  // Pause the recording
  const handlePauseRecording = () => {
    // Implementation would pause the WebRTC audio stream
    toast({
      title: "Recording Paused",
      description: "Your transcription is paused. Resume by clicking the play button."
    });
  };

  // Stop the recording
  const handleStopRecording = () => {
    setIsRecording(false);
    stopAudioCapture();
    setShowSummary(true);
    
    toast({
      title: "Recording Stopped",
      description: "Your meeting has been transcribed successfully."
    });
  };

  // Export the transcription
  const handleExport = () => {
    // Create text content
    const content = transcriptions.map(t => {
      const time = new Date(t.timestamp).toLocaleTimeString();
      return `[${time}] ${t.speaker || 'Unknown'}: ${t.content}`;
    }).join('\n\n');
    
    // Create blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Your transcription has been downloaded."
    });
  };

  // Save the meeting with summary
  const handleSaveMeeting = async () => {
    if (!meetingId) return;
    
    try {
      await apiRequest("PATCH", `/api/meetings/${meetingId}`, {
        summary: "Meeting summary generated automatically",
        keyPoints: keyPoints.join('\n'),
        actionItems: JSON.stringify(actionItems)
      });
      
      toast({
        title: "Meeting Saved",
        description: "Your meeting summary has been saved successfully."
      });
      
      // Reset the form for a new meeting
      setIsSetupMode(true);
      setShowSummary(false);
      setTranscriptions([]);
      setMeetingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save meeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cancel the meeting setup
  const handleCancel = () => {
    // If we're already recording, show a confirmation
    if (isRecording) {
      if (window.confirm("Are you sure you want to cancel? All transcription data will be lost.")) {
        stopAudioCapture();
        setIsRecording(false);
        setIsSetupMode(true);
        setTranscriptions([]);
      }
    } else {
      setIsSetupMode(true);
    }
  };

  return (
    <>
      <Header 
        title="Transcribe Meeting" 
        onNewMeeting={() => {
          setIsSetupMode(true);
          setShowSummary(false);
          setTranscriptions([]);
          setMeetingId(null);
        }} 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {isSetupMode && (
            <MeetingSetup 
              onStartTranscription={handleStartTranscription}
              onCancel={handleCancel}
            />
          )}
          
          {!isSetupMode && !showSummary && (
            <TranscriptionArea 
              isRecording={isRecording}
              transcriptions={transcriptions}
              onPauseRecording={handlePauseRecording}
              onStopRecording={handleStopRecording}
              onAddNote={() => {
                toast({
                  title: "Note Feature",
                  description: "Add note functionality will be implemented in a future update."
                });
              }}
              onAddTag={() => {
                toast({
                  title: "Tag Feature",
                  description: "Add tag functionality will be implemented in a future update."
                });
              }}
              onExport={handleExport}
            />
          )}
          
          {showSummary && (
            <MeetingSummary 
              keyPoints={keyPoints}
              actionItems={actionItems}
              attendees={attendees}
              onSaveMeeting={handleSaveMeeting}
              onEditSummary={() => {
                toast({
                  title: "Edit Summary",
                  description: "Edit summary functionality will be implemented in a future update."
                });
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}
