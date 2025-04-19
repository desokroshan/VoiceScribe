import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Laptop, Mic, Video, Plus, X } from "lucide-react";
import { format } from "date-fns";

interface MeetingSetupProps {
  onStartTranscription: (meetingName: string, enableSpeakerIdentification: boolean) => void;
  onCancel: () => void;
}

type AudioSource = "system" | "microphone" | "zoom" | "other";

export function MeetingSetup({ onStartTranscription, onCancel }: MeetingSetupProps) {
  const [meetingName, setMeetingName] = useState("Marketing Team Weekly");
  const [selectedSource, setSelectedSource] = useState<AudioSource>("system");
  const [enableSpeakerIdentification, setEnableSpeakerIdentification] = useState(true);
  
  const handleStartTranscription = () => {
    onStartTranscription(meetingName, enableSpeakerIdentification);
  };
  
  const audioSources = [
    { id: "system", icon: <Laptop className="mr-2 h-4 w-4" />, label: "System Audio" },
    { id: "microphone", icon: <Mic className="mr-2 h-4 w-4" />, label: "Microphone" },
    { id: "zoom", icon: <Video className="mr-2 h-4 w-4" />, label: "Zoom" },
    { id: "other", icon: <Plus className="mr-2 h-4 w-4" />, label: "Other" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-4">Meeting Setup</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="meeting-name" className="text-sm font-medium text-gray-700 mb-1">Meeting Name</Label>
            <Input 
              id="meeting-name"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Weekly Team Sync"
              className="w-full"
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1">Date & Time</Label>
            <div className="flex items-center text-gray-500 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{format(new Date(), "MMMM d, yyyy • h:mm a")}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Label className="text-sm font-medium text-gray-700 mb-1">Audio Source</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            {audioSources.map((source) => (
              <Button
                key={source.id}
                type="button"
                variant={selectedSource === source.id ? "secondary" : "outline"}
                className={selectedSource === source.id ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                onClick={() => setSelectedSource(source.id as AudioSource)}
              >
                {source.icon}
                <span>{source.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-5 bg-gray-50 rounded-b-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-3 sm:mb-0">
            <Switch 
              id="speaker-identification"
              checked={enableSpeakerIdentification}
              onCheckedChange={setEnableSpeakerIdentification}
              className="mr-2"
            />
            <Label htmlFor="speaker-identification" className="text-sm text-gray-700">
              Speaker Identification
            </Label>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleStartTranscription} className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Start Transcribing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
