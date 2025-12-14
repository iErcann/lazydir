import { ChevronRight, HardDrive } from "lucide-react";
import { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import {
  OperatingSystem,
  PathInfo,
} from "../../bindings/lazydir/internal/models";

export function PathBar({
  pane,
  onPathChange,
}: {
  pane: Pane;
  onPathChange: (newPath: string) => void;
}) {
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const operatingSystem = useFileSystemStore((state) => state.operatingSystem);
  const [pathInfo, setPathInfo] = useState<PathInfo>();
  useEffect(() => {
    const fetchPathInfo = async () => {
      const pathInfo = await getPathInfo(pane.path);
      console.log("Fetched path info:", pathInfo);
      setPathInfo(pathInfo);
    };

    fetchPathInfo();
  }, [pane.path, getPathInfo]);

  const getPathAtIndex = (index: number) => {
    if (!pathInfo) return "";
    const parts = pathInfo.parts.slice(0, index + 1);
    // Prepend root for Linux/macOS; for Windows, first part includes drive
    if (operatingSystem === OperatingSystem.OSWindows) {
      return parts.join(pathInfo.separator); // Windows -> C:\Users\Me
    } else {
      return pathInfo.separator + parts.join(pathInfo.separator); // Linux/macOS -> /home/user
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <button
        className="p-1.5 rounded-lg"
        onClick={() => onPathChange(pathInfo?.root ?? "")}
      >
        <HardDrive className="w-5 h-5 text-[var(--text-primary)]" />
      </button>

      {pathInfo?.parts.map((part: string, i: number) => {
        return (
          <div className="flex items-center gap-2" key={i}>
            <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
            <button
              className="px-2 py-1 rounded-lg text-sm text-[var(--text-primary)]"
              onClick={() => onPathChange(getPathAtIndex(i))}
            >
              {part}
            </button>
          </div>
        );
      })}
    </div>
  );
}
