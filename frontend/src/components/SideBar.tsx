import { useState } from "react";
import { Home, Image, Video, Trash2, Folder, HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFileSystemStore } from "../store/directoryStore";
import { useTabsStore } from "../store/tabsStore";
import { OperatingSystem } from "../../bindings/lazydir/internal";

// Sidebar Component
export function Sidebar() {
  const getShortcuts = useFileSystemStore((state) => state.getShortcuts);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const getActivePane = useTabsStore((state) => state.getActivePane);
  const operatingSystem = useFileSystemStore((state) => state.operatingSystem);

  const { data: shortcuts, error } = useQuery({
    queryKey: ["sidebarShortcuts"],

    queryFn: () => {
      console.log("Sidebar: Loading shortcuts");
      return getShortcuts();
    },

    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });

  if (error) {
    return (
      <div className="w-48 bg-(--bg-secondary) flex-col hidden sm:flex p-3">
        <div className="text-red-500 text-sm">
          Error loading shortcuts: {error.message}
        </div>
      </div>
    );
  }

  const onShortcutClick = (path: string) => {
    const activePane = getActivePane();
    if (activePane) {
      updatePanePath(activePane.tab.id, activePane.pane.id, path);
    }
  };

  return (
    <div className="w-36 bg-(--bg-secondary) flex-col hidden sm:flex">
      <div className="p-3">
        <h2
          className={`text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-2 mb-2 ${
            operatingSystem === OperatingSystem.OSMac ? "mt-8 " : ""
          }`}
        >
          lazydir
        </h2>
        <div className="space-y-0.5">
          {shortcuts?.map((shortcut) => {
            return (
              <button
                key={shortcut.name}
                onClick={() => {
                  onShortcutClick(shortcut.path);
                }}
                className={
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-(--text-primary) hover:bg-(--bg-tertiary)"
                }
              >
                <span>{shortcut.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
