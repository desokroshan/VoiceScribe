import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pause, OctagonMinus, Plus, Tag, Download, Settings } from "lucide-react";
import { format } from "date-fns";
import { Transcription, ChatResponse } from "@shared/schema";
import { isLikelyQuestion, sendMessageToChatGpt } from "@/lib/chatgpt";
import { ChatGptResponse } from "./ChatGptResponse";
import { ChatGptSettings } from "./ChatGptSettings";

interface TranscriptionAreaProps {
  isRecording: boolean;
  transcriptions: Transcription[];
  onPauseRecording: () => void;
  onStopRecording: () => void;
  onAddNote: () => void;
  onAddTag: () => void;
  onExport: () => void;
}

export function TranscriptionArea({
  isRecording,
  transcriptions,
  onPauseRecording,
  onStopRecording,
  onAddNote,
  onAddTag,
  onExport
}: TranscriptionAreaProps) {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const transcriptionRef = useRef<HTMLDivElement>(null);
  
  // ChatGPT integration states
  const [chatGptSettings, setChatGptSettings] = useState({
    enabled: true,
    customPrompt: "",
    autoDetectQuestions: true
  });
  
  // Create a wrapper function to handle type compatibility with ChatGptSettings component
  const handleSettingsChange = (newSettings: any) => {
    setChatGptSettings(newSettings);
  };
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [lastProcessedIndex, setLastProcessedIndex] = useState(-1);
  
  // Process new transcriptions for questions and send to ChatGPT if enabled
  useEffect(() => {
    if (!chatGptSettings.enabled || !chatGptSettings.autoDetectQuestions || !transcriptions.length) {
      return;
    }

    // Process only new transcriptions that haven't been processed yet
    const newTranscriptions = transcriptions.slice(lastProcessedIndex + 1);
    if (!newTranscriptions.length) return;

    // Update the last processed index
    setLastProcessedIndex(transcriptions.length - 1);

    // Find the most recent message that looks like a question
    const lastPotentialQuestion = [...newTranscriptions].reverse().find(transcript => 
      isLikelyQuestion(transcript.content)
    );

    if (lastPotentialQuestion) {
      handleQuestion(lastPotentialQuestion.content);
    }
  }, [transcriptions, chatGptSettings, lastProcessedIndex]);

  // Process a question and get a response from ChatGPT
  const handleQuestion = async (message: string) => {
    setChatResponse(null);
    setIsLoadingResponse(true);

    try {
      const response = await sendMessageToChatGpt(message, chatGptSettings.customPrompt);
      setChatResponse(response);
    } catch (error) {
      console.error("Failed to get ChatGPT response:", error);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Handle dismissing a ChatGPT response
  const handleDismissResponse = () => {
    setChatResponse(null);
  };

  // Auto-scroll to the bottom when new transcriptions come in
  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptions]);
  
  // Timer for recording duration
  useEffect(() => {
    if (!isRecording) return;
    
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRecording]);
  
  // Format seconds to hh:mm:ss
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Helper to generate colors based on speaker
  const getSpeakerColor = (speaker: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-600" },
      { bg: "bg-purple-100", text: "text-purple-600" },
      { bg: "bg-green-100", text: "text-green-600" },
      { bg: "bg-yellow-100", text: "text-yellow-600" },
      { bg: "bg-red-100", text: "text-red-600" }
    ];
    
    const hash = speaker.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <h3 className="font-medium">Recording in progress</h3>
            <span className="ml-3 text-sm text-gray-500">{formatDuration(recordingDuration)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <ChatGptSettings
              settings={chatGptSettings}
              onSettingsChange={handleSettingsChange}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onPauseRecording}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onStopRecording}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <OctagonMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={transcriptionRef} className="p-5 max-h-96 overflow-y-auto">
          {transcriptions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Waiting for speech to transcribe...</p>
            </div>
          ) : (
            transcriptions.map((transcript, index) => {
              const speakerColor = getSpeakerColor(transcript.speaker || "Unknown");
              const initials = getInitials(transcript.speaker || "Unknown");
              const time = transcript.timestamp ? format(new Date(transcript.timestamp), "h:mm a") : "";
              
              return (
                <div key={index} className="mb-6">
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full ${speakerColor.bg} ${speakerColor.text} flex items-center justify-center flex-shrink-0 mr-3`}>
                      <span className="text-xs font-medium">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-gray-900">{transcript.speaker || "Unknown"}</h4>
                        <span className="ml-2 text-xs text-gray-500">{time}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {transcript.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-50">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={onAddNote} className="flex items-center mr-3 gap-2">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
            <Button variant="outline" size="sm" onClick={onAddTag} className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Add Tag
            </Button>
          </div>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport} 
              className="text-primary border-primary hover:bg-blue-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* ChatGPT Response Area */}
      {(isLoadingResponse || chatResponse) && (
        <ChatGptResponse
          isLoading={isLoadingResponse}
          response={chatResponse}
          onDismiss={handleDismissResponse}
          className="mt-4 animate-fadeIn"
        />
      )}
    </div>
  );
}
