import { useTabsStore } from "../store/tabsStore";
import { Tab } from "../types";

export function TabItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const activateTab = useTabsStore((state) => state.activateTab);
  const closeTab = useTabsStore((state) => state.closeTab);

  const firstPane = tab.panes[0];
  const path = firstPane?.path ?? "";
  const parts = path.split(/[/\\]+/).filter(Boolean);
  const folderName = parts.at(-1) || path || "Untitled";

  return (
    <div
      className={`flex-1 flex items-center justify-center cursor-pointer relative
        border-b-2 pb-1 transition
        ${
          isActive
            ? "border-[var(--accent)] font-semibold "
            : "border-transparent text-[var(--text-secondary)]"
        }`}
      onClick={() => activateTab(tab.id)}
      title={folderName}
    >
      <span className="truncate">{folderName}</span>

      {/* Close button */}
      {closeTab && (
        <button
          className="absolute right-1 top-1 w-8 h-8 flex items-center justify-center
                     text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                     rounded transition"
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.id);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
