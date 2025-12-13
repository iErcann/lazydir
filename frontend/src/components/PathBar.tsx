import { ChevronRight, Home } from "lucide-react";
import { useTabsStore } from "../store/tabsStore";

export function PathBar() {
  const activePane = useTabsStore((state) => state.getActivePane());
  const parts = activePane?.path.split("/").filter(Boolean) ?? [];

  return (
    <div className="flex items-center gap-2 px-4 py-2  ">
      <button className="p-1.5 rounded-lg">
        <Home className="w-5 h-5 text-white" />
      </button>

      {parts.map((part, i) => (
        <div className="flex items-center gap-2" key={i}>
          <ChevronRight className="w-4 h-4 text-white" />
          <button className="px-2 py-1 rounded-lg text-sm text-white">{part}</button>
        </div>
      ))}
    </div>
  );
}
