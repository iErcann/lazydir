import { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { PathInfo } from "../../bindings/lazydir/internal/models";

interface PathBarProps {
  pane: Pane;
  onPathChange: (newPath: string) => void;
}

export function PathBar({ pane, onPathChange }: PathBarProps) {
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);
  const [pathInfo, setPathInfo] = useState<PathInfo>();

  // Fetch path info whenever the pane path changes
  useEffect(() => {
    const fetchPathInfo = async () => {
      const pathInfo = await getPathInfo(pane.path);
      if (!pathInfo.data) return;
      console.log("Fetched path info:", pathInfo);
      setPathInfo(pathInfo.data);
    };
    fetchPathInfo();
  }, [pane.path, getPathInfo]);

  // Get the path corresponding to a specific part index
  const fetchPathAtIndex = async (index: number) => {
    if (!pathInfo) return "";
    const result = await getPathAtIndex(pathInfo.fullPath, index);
    if (result.error) {
      console.error("Error getting path at index:", result.error);
      return "";
    }
    console.log("Fetched path at index:", result.data);
    return result.data ?? "";
  };

  return (
    <div className="mx-auto flex items-center gap-1 px-3 py-1 rounded-md bg-[var(--bg-secondary)] backdrop-blur border border-white/5 min-w-1/2 mt-2">
      {pathInfo?.parts.map((part: string, i: number) => {
        const isActive = i === pathInfo.parts.length - 1; // Last part is active

        return (
          <div key={i} className="flex items-center gap-1">
            <button
              onClick={async () => onPathChange(await fetchPathAtIndex(i))}
              className={`
                px-2.5 py-1
                rounded-md
                text-sm   
                transition 
                ${
                  isActive
                    ? "text-[var(--text-primary)] font-bold" // Active part styling
                    : "hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-medium"
                }
              `}
            >
              {part}
            </button>

            {/* Separator between path parts */}
            {i !== pathInfo.parts.length - 1 && (
              <span className="text-gray-400 text-sm px-0.5">/</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
