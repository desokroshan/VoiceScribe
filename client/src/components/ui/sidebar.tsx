import { Link, useLocation } from "wouter";
import { Mic, Home, Clock, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
};

export function Sidebar() {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: <Mic className="w-5 h-5" />,
      label: "Transcribe",
      href: "/transcribe",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "History",
      href: "/history",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <aside className="bg-gray-900 text-white w-16 md:w-64 flex flex-col transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-center md:justify-start p-4 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-green-400 text-2xl">
            <Mic className="w-6 h-6" />
          </span>
          <span className="ml-2 text-lg font-semibold hidden md:block">VoiceScribe</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto pt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-1 px-2">
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center py-2 px-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200",
                    location === item.href && "bg-gray-800 text-white"
                  )}
                >
                  <span className="text-xl w-8 text-center">{item.icon}</span>
                  <span className="ml-3 hidden md:block">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
            <span className="text-sm font-medium">JS</span>
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium">John Smith</p>
            <p className="text-xs text-gray-400">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
