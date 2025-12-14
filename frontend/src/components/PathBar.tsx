import { ChevronRight, HardDrive } from "lucide-react";
import { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect } from "react";
import { OperatingSystem } from "../../bindings/lazydir/internal/models";

export function PathBar({
  pane,
  onPathChange,
}: {
  pane: Pane;
  onPathChange: (newPath: string) => void;
}) {
  const operatingSystem = useFileSystemStore((state) => state.operatingSystem);
  // Use platform-agnostic separator
  let separator = "/";
  if (operatingSystem === OperatingSystem.OSWindows) {
    separator = "\\";
  } else if (operatingSystem === OperatingSystem.OSLinux || operatingSystem === OperatingSystem.OSMacOS) {
    separator = "/";
  }
  const parts = pane.path.split(separator).filter(Boolean);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <button
        className="p-1.5 rounded-lg"
        onClick={() => onPathChange(separator)}
      >
        <HardDrive className="w-5 h-5 text-[var(--text-primary)]" />
      </button>

      {parts.map((part: string, i: number) => {
        // Reconstruct the path up to this part
        const newPath = separator + parts.slice(0, i + 1).join(separator);
        return (
          <div className="flex items-center gap-2" key={i}>
            <ChevronRight className="w-4 h-4 text-[var(--text-primary)]" />
            <button
              className="px-2 py-1 rounded-lg text-sm text-[var(--text-primary)]"
              onClick={() => onPathChange(newPath)}
            >
              {part}
            </button>
          </div>
        );
      })}
    </div>
  );
}
