import { useTabsStore } from "../store/tabsStore";
import { FileManagerTab } from "./FileManagerTab";
import { TabBar } from "./TabBar";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFileSystemStore } from "../store/directoryStore";
import { Sidebar } from "./SideBar";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";

export function FileManager() {
  const createTab = useTabsStore((s) => s.createTab);
  const tabs = useTabsStore((s) => s.tabs);
  const activeTab = useTabsStore((s) => s.getActiveTab());

  // File system stuff
  const { getOperatingSystem, getInitialPath } = useFileSystemStore();
  // Query OS (just populate store)
  useQuery({
    queryKey: ["os"],
    queryFn: getOperatingSystem,
    staleTime: Infinity,
  });

  // Query initial path
  const {
    data: initialPath,
    isLoading: pathLoading,
    error: pathError,
  } = useQuery({
    queryKey: ["initialPath"],
    queryFn: () => {
      console.log("FileManager: Fetching initial path");
      return getInitialPath();
    },
    staleTime: Infinity,
    select: (res) => {
      if (res.error) throw res.error;
      return res.data ?? ".";
    }, // fallback to "."
    retry: false,
    refetchOnWindowFocus: false, // otherwise it will refetch on alt tab.
    refetchOnMount: false,
    gcTime: 0,
  });

  // Create first tab when initialPath is ready
  useEffect(() => {
    if (!activeTab && initialPath) {
      createTab(initialPath);
    }
  }, [activeTab, initialPath, createTab]);

  // Ctrl+T to open new tab
  useKeyboardShortcut({
    key: "t",
    ctrl: true,
    preventDefault: true,
    handler: async () => {
      const result = await getInitialPath();
      createTab(result.data ?? ".");
    },
  });

  // Ctrl+W to close current tab
  useKeyboardShortcut({
    key: "w",
    ctrl: true,
    preventDefault: true,
    handler: () => {
      if (activeTab) {
        useTabsStore.getState().closeTab(activeTab.id);
      }
    },
  });

  // Ctrl + PageUp to switch to previous tab
  useKeyboardShortcut({
    key: "PageUp",
    ctrl: true,
    preventDefault: true,
    handler: () => {
      if (!activeTab || tabs.length <= 1) return;

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.id);
      const previousIndex = (currentIndex - 1 + tabs.length) % tabs.length; // Loop around
      const previousTab = tabs[previousIndex];

      useTabsStore.getState().activateTab(previousTab.id);
    },
  });

  // Ctrl + PageDown to switch to next tab
  useKeyboardShortcut({
    key: "PageDown",
    ctrl: true,
    preventDefault: true,
    handler: () => {
      const tabs = useTabsStore.getState().tabs;
      const activeTab = useTabsStore.getState().getActiveTab();
      if (!activeTab || tabs.length <= 1) return;

      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.id);
      const nextIndex = (currentIndex + 1) % tabs.length; // Loop around
      const nextTab = tabs[nextIndex];

      useTabsStore.getState().activateTab(nextTab.id);
    },
  });
  // Show loading state
  if (pathLoading)
    return <div className="p-4 text-(--text-secondary)">Loading...</div>;
  if (pathError)
    return (
      <div className="p-4 text-red-500">
        Error loading path: {pathError.message}
      </div>
    );
  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-screen w-screen bg-(--bg-primary) text-[--text-primary)] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.length > 1 && <TabBar />}
          <FileManagerTab tabId={activeTab.id} />
        </div>
      </div>
    </div>
  );
}
