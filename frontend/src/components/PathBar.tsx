import { ChevronRight, Home } from "lucide-react";
import { Pane } from "../types";

export function PathBar({
  pane,
  onPathChange,
}: {
  pane: Pane;
  onPathChange: (newPath: string) => void;
}) {
  // Use platform-agnostic separator
  const separator = pane.path.includes("\\") ? "\\" : "/";
  const parts = pane.path.split(separator).filter(Boolean);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <button className="p-1.5 rounded-lg" onClick={() => onPathChange(separator)}>
        <Home className="w-5 h-5 text-white" />
      </button>

      {parts.map((part: string, i: number) => {
        // Reconstruct the path up to this part
        const newPath = separator + parts.slice(0, i + 1).join(separator);
        return (
          <div className="flex items-center gap-2" key={i}>
            <ChevronRight className="w-4 h-4 text-white" />
            <button
              className="px-2 py-1 rounded-lg text-sm text-white"
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
