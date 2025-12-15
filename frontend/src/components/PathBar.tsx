import { ChevronRight, HardDrive } from "lucide-react";
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
  useEffect(() => {
    const fetchPathInfo = async () => {
      const pathInfo = await getPathInfo(pane.path);
      if (!pathInfo.data) return;
      console.log("Fetched path info:", pathInfo);
      setPathInfo(pathInfo.data);
    };

    fetchPathInfo();
  }, [pane.path, getPathInfo]);

  const fetchPathAtIndex = async (index: number) => {
    if (!pathInfo) return "";
    const result = await getPathAtIndex(pathInfo.fullPath, index);
    console.log("Fetched path at index:", result.data);
    if (result.error) {
      console.error("Error getting path at index:", result.error);
      return "";
    }
    return result.data ?? "";
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {/*       <button
        className="p-1.5 rounded-lg"
        onClick={() => onPathChange(pathInfo?.root ?? "")}
      >
        <HardDrive className="w-5 h-5 text-[var(--text-primary)]" />
      </button> */}

      {pathInfo?.parts.map((part: string, i: number) => {
        return (
          <div className="flex items-center gap-2" key={i}>
            <button
              className="px-2 py-1 rounded-lg text-sm text-[var(--text-primary)]"
              onClick={async () => onPathChange(await fetchPathAtIndex(i))}
            >
              {part}
            </button>
            {i === pathInfo.parts.length - 1 ? null : (
              <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
