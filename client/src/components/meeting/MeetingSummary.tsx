import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Attendee {
  name: string;
  initials: string;
  color: string;
}

interface MeetingSummaryProps {
  keyPoints: string[];
  actionItems: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  attendees: Attendee[];
  onSaveMeeting: () => void;
  onEditSummary: () => void;
}

export function MeetingSummary({ 
  keyPoints, 
  actionItems, 
  attendees, 
  onSaveMeeting, 
  onEditSummary 
}: MeetingSummaryProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    actionItems.reduce((acc, item) => ({ ...acc, [item.id]: item.completed }), {})
  );
  
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-4">Meeting Summary</h2>
        
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Key Points</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Action Items</h3>
          <ul className="space-y-2 text-sm">
            {actionItems.map((item) => (
              <li key={item.id} className="flex items-start">
                <Checkbox 
                  id={`action-${item.id}`}
                  checked={checkedItems[item.id]}
                  onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                  className="mt-1 mr-2"
                />
                <Label 
                  htmlFor={`action-${item.id}`}
                  className="text-gray-700"
                >
                  {item.text}
                </Label>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Attendees</h3>
          <div className="flex flex-wrap gap-2">
            {attendees.map((attendee, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-full pl-1 pr-3 py-1">
                <div className={`w-6 h-6 rounded-full ${attendee.color} flex items-center justify-center mr-1`}>
                  <span className="text-xs font-medium">{attendee.initials}</span>
                </div>
                <span className="text-sm">{attendee.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex justify-end">
          <Button variant="outline" className="mr-3" onClick={onEditSummary}>
            Edit Summary
          </Button>
          <Button onClick={onSaveMeeting}>
            Save Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
