import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Meeting } from "@shared/schema";
import { Mic, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function History() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: meetings, isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });
  
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meetings/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({
        title: "Meeting Deleted",
        description: "The meeting has been successfully deleted."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleDeleteMeeting = (id: number) => {
    if (window.confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      deleteMeetingMutation.mutate(id);
    }
  };
  
  return (
    <>
      <Header 
        title="Meeting History" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-6 text-center text-gray-500">Loading meetings...</div>
              ) : meetings && meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-600 mr-3">
                              <Mic className="h-4 w-4" />
                            </div>
                            <h3 className="font-medium">{meeting.name}</h3>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(meeting.date), "MMMM d, yyyy • h:mm a")}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 mb-3">
                          {meeting.summary || "No summary available"}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Export
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <h3 className="font-medium text-gray-700 mb-1">No meeting history</h3>
                  <p className="text-sm text-gray-500">Start transcribing to create meeting records</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
