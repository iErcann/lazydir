import { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useState, useRef } from "react";
import { PathInfo } from "../../bindings/lazydir/internal/models";
import { useQuery } from "@tanstack/react-query";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";
import { useTabsStore } from "../store/tabsStore";

interface PathBarProps {
  paneId: string;
  tabId: string;
  onPathChange: (newPath: string) => void;
}

export function PathBar({ paneId, tabId, onPathChange }: PathBarProps) {
  const pane = useTabsStore((s) => s.getPane(tabId, paneId)!);
  const activePaneId = useTabsStore((s) => s.getActivePane()?.pane.id ?? null);

  const getPathInfo = useFileSystemStore((s) => s.getPathInfo);
  const getPathAtIndex = useFileSystemStore((s) => s.getPathAtIndex);

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Query PathInfo with select
  const {
    data: pathInfo,
    error: pathInfoError,
    refetch: refetchPathInfo,
  } = useQuery({
    queryKey: ["pathInfo", pane.path],
    queryFn: () => {
      console.log("PathBar: Loading path info for path", pane.path);
      return getPathInfo(pane.path);
    },
    select: (result) => {
      if (result.error) throw result.error;
      if (!result.data) throw new Error("No path info returned");
      return result.data as PathInfo;
    },
  });

  // Get the path corresponding to a specific part index
  const fetchPathAtIndex = async (index: number) => {
    if (!pathInfo) return "";
    const result = await getPathAtIndex(pathInfo.fullPath, index);
    if (result.error) {
      console.error("Error getting path at index:", result.error);
      return "";
    }
    return result.data ?? "";
  };

  // Handle Enter / Escape keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onPathChange(e.currentTarget.value);
      setEditing(false);
      refetchPathInfo();
    } else if (e.key === "Escape") {
      setEditing(false);
    }
  };

  // Click on bar (not buttons) activates editing
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") return;
    setEditing(true);
  };

  // Ctrl L focuses input
  useKeyboardShortcut({
    key: "l",
    ctrl: true,
    preventDefault: true,
    handler: async () => {
      // Only focus if this is the active pane
      if (activePaneId !== pane.id) return;
      setEditing(true);
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    },
  });

  if (pathInfoError) {
    return (
      <div className="w-full bg-(--bg-secondary) flex items-center px-3 py-1.5">
        <div className="text-(--text-secondary) text-sm">
          Error loading path info: {pathInfoError.message}
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex items-center gap-1 px-3 py-1 rounded-md bg-(--bg-primary) backdrop-blur border border-(--bg-tertiary) mt-0.5 cursor-text flex-1 overflow-x-auto"
      onClick={handleBarClick}
    >
      {editing ? (
        // Input mode - key prop resets state when pane.path changes
        <input
          key={pane.path}
          ref={inputRef}
          defaultValue={pane.path}
          onBlur={() => setEditing(false)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 min-w-[100px] px-2 py-1 rounded-md bg-(--bg-secondary) text-(--text-primary) outline-none"
        />
      ) : (
        // Normal path buttons
        <div className="inline-flex items-center gap-1">
          {pathInfo?.parts.map((part: string, i: number) => {
            const isActive = i === pathInfo.parts.length - 1;
            return (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={async () => onPathChange(await fetchPathAtIndex(i))}
                  className={`
                    px-2.5 py-1 rounded-md text-sm transition
                    ${
                      isActive
                        ? "text-(--text-primary) font-bold"
                        : "hover:bg-(--bg-tertiary) text-(--text-secondary) font-medium"
                    }
                  `}
                >
                  {part}
                </button>
                {i !== pathInfo.parts.length - 1 && (
                  <span className="text-gray-400 text-sm px-0.5"> / </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
