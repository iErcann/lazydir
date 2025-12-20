import { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState, useRef } from "react";
import { PathInfo } from "../../bindings/lazydir/internal/models";

interface PathBarProps {
  pane: Pane;
  onPathChange: (newPath: string) => void;
}

export function PathBar({ pane, onPathChange }: PathBarProps) {
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);
  const [pathInfo, setPathInfo] = useState<PathInfo>();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(pane.path);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch path info whenever the pane path changes
  useEffect(() => {
    const fetchPathInfo = async () => {
      const pathInfo = await getPathInfo(pane.path);
      if (!pathInfo.data) return;
      setPathInfo(pathInfo.data);
    };
    fetchPathInfo();
    setInputValue(pane.path); // keep input in sync
  }, [pane.path, getPathInfo]);

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

  // Focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Handle Enter / Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onPathChange(inputValue);
      setEditing(false);
    } else if (e.key === "Escape") {
      setInputValue(pane.path);
      setEditing(false);
    }
  };

  // Click on bar (not buttons) activates editing
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent editing if a button inside was clicked
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON") return;

    setEditing(true);
  };

  return (
    <div
      className="mx-auto flex items-center gap-1 px-3 py-1 rounded-md bg-(--bg-secondary) backdrop-blur border border-white/5 min-w-1/2 mt-2 cursor-text"
      onClick={handleBarClick}
    >
      {editing ? (
        // Input mode
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 rounded-md bg-(--bg-secondary) text-(--text-primary) border border-white/10 outline-none"
        />
      ) : (
        // Normal path buttons
        pathInfo?.parts.map((part: string, i: number) => {
          const isActive = i === pathInfo.parts.length - 1; // Last part is active
          return (
            <div key={i} className="flex items-center gap-1">
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
                <span className="text-gray-400 text-sm px-0.5">/</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
