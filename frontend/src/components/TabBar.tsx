import { useTabsStore } from "../store/tabsStore";
import { TabItem } from "./TabItem";

export function TabBar() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const createTab = useTabsStore((state) => state.createTab);

  if (!activeTabId) return null;

  return (
    <div className="h-10 bg-[var(--bg-primary)] flex items-center px-2 text-[var(--text-primary)]">
      {/* Tabs container */}
      <div className="flex flex-1 h-full overflow-hidden">
        {tabs.map((tab) => (
          <TabItem key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
        ))}
      </div>

      {/* + New Tab Button */}
      <button
        className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    hover:bg-[var(--bg-tertiary)] transition"
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
