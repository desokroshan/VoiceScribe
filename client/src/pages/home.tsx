import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@shared/schema";
import { FileText, Clock, Mic, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  // Function to navigate programmatically
  const navigate = (path: string) => setLocation(path);
  
  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });
  
  const getMeetingDurationString = (minutes: number) => {
    if (!minutes) return "N/A";
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };

  return (
    <>
      <Header 
        title="Dashboard" 
        onNewMeeting={() => navigate("/transcribe")}
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Transcriptions</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meetings?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Across all meetings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Time Transcribed</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getMeetingDurationString(meetings?.reduce((acc, m) => acc + (m.duration || 0), 0) || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total minutes saved</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Last Transcription</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {meetings && meetings.length > 0 
                    ? format(new Date(meetings[0].date), "MMM d")
                    : "Never"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {meetings && meetings.length > 0 
                    ? format(new Date(meetings[0].date), "h:mm a")
                    : "No transcriptions yet"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center text-gray-500">Loading meetings...</div>
              ) : meetings && meetings.length > 0 ? (
                <div className="divide-y">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-4">
                          <Mic className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{meeting.name}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(meeting.date), "MMMM d, yyyy • h:mm a")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <h3 className="font-medium text-gray-700 mb-1">No meetings yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Start transcribing your first meeting</p>
                  <Button onClick={() => navigate("/transcribe")}>
                    <Mic className="mr-2 h-4 w-4" />
                    New Meeting
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
