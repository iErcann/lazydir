import { ChevronRight, Home } from "lucide-react";
import { Pane } from "../types";

export function PathBar({ pane }: { pane: Pane }) {
  const parts = pane.path.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
      <button className="p-1.5 rounded-lg hover:bg-zinc-800">
        <Home className="w-5 h-5" />
      </button>

      {parts.map((part, i) => (
        <div className="flex items-center gap-2" key={i}>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
          <button className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-sm">
            {part}
          </button>
        </div>
      ))}
    </div>
  );
}
