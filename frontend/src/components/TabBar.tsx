import { useTabsStore } from "../store/tabsStore";

export function TabBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const activateTab = useTabsStore((state) => state.activateTab);
  const createTab = useTabsStore((state) => state.createTab);

  return (
    <div className="h-10 bg-[var(--bg-primary)] flex items-center px-2 text-[var(--text-primary)]">
      {/* Tabs container grows to fill space */}
      <div className="flex flex-1 h-full overflow-hidden">
        {tabs.map((tab) => {
          const firstPane = tab.panes[0];
          const path = firstPane?.path ?? "";

          const parts = path.split(/[/\\]+/).filter(Boolean);
          const folderName = parts.at(-1) || path || "Untitled";

          return (
            <div
              key={tab.id}
              className={`flex-1 flex items-center justify-center cursor-pointer 
                border-b-2 pb-1 transition 
                ${
                  tab.id === activeTabId
                    ? "border-[var(--accent)] font-semibold"
                    : "border-transparent text-[var(--text-secondary)]"
                }`}
              onClick={() => activateTab(tab.id)}
              title={folderName}
            >
              <span className="truncate">{folderName}</span>
            </div>
          );
        })}
      </div>

      {/* + New Tab Button */}
      <button
        className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded
                   text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                   hover:bg-[var(--bg-secondary)] transition"
        onClick={() => {
          const activeTab = tabs.find((tab) => tab.id === activeTabId);
          createTab(activeTab?.panes[0]?.path);
        }}
        aria-label="New Tab"
      >
        +
      </button>
    </div>
  );
}
