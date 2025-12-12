import { useState } from "react";
import { Home, Image, Video, Trash2, Folder, HardDrive } from "lucide-react";

 

interface SidebarProps {
  activeLocation: string;
  onLocationSelect: (location: string) => void;
}

// Sidebar Component
export function Sidebar({
  onLocationSelect = (loc) => console.log("Navigate to:", loc),
}: Partial<SidebarProps>) {
  // Standard locations
  const sidebarItems = [
    { icon: HardDrive, label: "Computer", path: "/" },
    { icon: Home, label: "Home", path: "/home/ncr" },
    { icon: Folder, label: "Documents", path: "/home/ncr/Documents" },
    { icon: Folder, label: "Downloads", path: "/home/ncr/Downloads" },
    { icon: Image, label: "Pictures", path: "/home/ncr/Pictures" },
  ];

  return (
    <div className="w-48 bg-[var(--bg-secondary)] border-r border-gray-800 flex flex-col">
      <div className="p-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
          Favorites
        </h2>
        <div className="space-y-0.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {}}
                className={
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-gray-300 hover:bg-[var(--bg-tertiary)]"
                }
              >
                <Icon className="w-4 h-4 bg-" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
