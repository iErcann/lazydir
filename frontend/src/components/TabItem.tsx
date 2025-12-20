import { useTabsStore } from "../store/tabsStore";
import { Tab } from "../types";
import { useMemo } from "react";

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
}

export function TabItem({ tab, isActive }: TabItemProps) {
  // Actions from the tabs store
  const activateTab = useTabsStore((state) => state.activateTab);
  const closeTab = useTabsStore((state) => state.closeTab);

  /**
   * Compute the display name for the tab once.
   * - Uses the last part of the first pane's path
   * - Falls back to "Untitled" if no path exists
   * - Appends pane count if the tab has multiple panes
   */
  const folderName = useMemo(() => {
    if (tab.panes.length === 0) {
      return "Untitled";
    }

    const parts = (tab.panes[0].path ?? "")
      .split(/[/\\]+/)
      .filter(Boolean);

    const firstName =
      parts.at(-1) || tab.panes[0].path || "Untitled";

    return tab.panes.length > 1
      ? `${firstName} (${tab.panes.length} panes)`
      : firstName;
  }, [tab.panes]);

  // Activate tab on left click
  const handleClick = () => activateTab(tab.id);

  /**
   * Close tab on middle mouse click
   * - button === 1 → middle click
   * - buttons === 4 → middle button held (browser-dependent)
   */
  const handleMiddleClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.button === 1 || event.buttons === 4) {
      event.preventDefault();
      closeTab(tab.id);
    }
  };

  // Close button click should not activate the tab
  const handleCloseClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    closeTab(tab.id);
  };

  return (
    /**
     * `group` enables group-hover utilities for children
     * Used to reveal the close button only when hovering the tab
     */
    <div
      className={`group flex-1 flex items-center justify-center cursor-pointer relative
        border-b-2 pb-1 transition
        ${
          isActive
            ? "border-(--accent) font-semibold"
            : "border-transparent text-(--text-secondary) text-sm"
        }`}
      onClick={handleClick}
      onMouseDown={handleMiddleClick}
      title={folderName}
    >
      {/* Tab title (truncated if too long) */}
      <span className="truncate">{folderName}</span>

      {/*
        Close button:
        - Hidden by default (opacity-0, pointer-events-none)
        - Becomes visible & clickable on tab hover (group-hover)
        - Absolute positioning prevents layout shift
      */}
      <button
        className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center
                   text-(--text-secondary) hover:text-(--text-primary)
                   rounded transition
                   opacity-0 pointer-events-none
                   group-hover:opacity-100 group-hover:pointer-events-auto"
        onClick={handleCloseClick}
      >
        ×
      </button>
    </div>
  );
}
