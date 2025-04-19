import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  onNewMeeting?: () => void;
}

export function Header({ title, onNewMeeting }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
        {onNewMeeting && (
          <Button size="sm" className="gap-2" onClick={onNewMeeting}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Meeting</span>
          </Button>
        )}
      </div>
    </header>
  );
}
