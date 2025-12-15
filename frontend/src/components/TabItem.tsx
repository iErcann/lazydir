import { useTabsStore } from "../store/tabsStore";
import { Tab } from "../types";
import { useMemo } from "react";

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
}

export function TabItem({ tab, isActive }: TabItemProps) {
  const activateTab = useTabsStore((state) => state.activateTab);
  const closeTab = useTabsStore((state) => state.closeTab);

  // Compute folder name once
  const folderName = useMemo(() => {
    const firstPanePath = tab.panes[0]?.path ?? "";
    const parts = firstPanePath.split(/[/\\]+/).filter(Boolean);
    return parts.at(-1) || firstPanePath || "Untitled";
  }, [tab.panes]);

  const handleClick = () => activateTab(tab.id);

  const handleMiddleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button === 1 || event.buttons === 4) {
      event.preventDefault();
      closeTab(tab.id);
    }
  };

  const handleCloseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    closeTab(tab.id);
  };

  return (
    <div
      className={`flex-1 flex items-center justify-center cursor-pointer relative
        border-b-2 pb-1 transition
        ${
          isActive
            ? "border-[var(--accent)] font-semibold"
            : "border-transparent text-[var(--text-secondary)]"
        }`}
      onClick={handleClick}
      onMouseDown={handleMiddleClick}
      title={folderName}
    >
      <span className="truncate">{folderName}</span>

      <button
        className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     rounded transition"
        onClick={handleCloseClick}
      >
        ×
      </button>
    </div>
  );
}
