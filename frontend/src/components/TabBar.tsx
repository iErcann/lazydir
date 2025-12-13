import { useTabsStore } from "../store/tabsStore";

export function TabBar() {
  const activePane = useTabsStore((state) => state.getActivePane());
  const currentFolder = activePane?.path.split("/").pop();
  return (
    <div className="h-10 bg-[var(--bg-primary)] flex items-center px-4 text-white">
      <span> {currentFolder}</span>
    </div>
  );
}
