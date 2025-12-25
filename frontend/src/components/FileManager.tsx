import { useTabsStore } from "../store/tabsStore";
import { FileManagerTab } from "./FileManagerTab";
import { TabBar } from "./TabBar";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFileSystemStore } from "../store/directoryStore";
import { Sidebar } from "./SideBar";
import { useKeyboardShortcut } from "../hooks/useKeyboardShortcut";

export function FileManager() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const tabs = useTabsStore((state) => state.tabs);

  const getOperatingSystem = useFileSystemStore((state) => state.getOperatingSystem);
  const getInitialPath = useFileSystemStore((state) => state.getInitialPath);

  // Query OS (just populate store)
  useQuery({
    queryKey: ["os"],
    queryFn: getOperatingSystem,
    staleTime: Infinity,
  });

  // Query initial path
  const { data: initialPath, isLoading: pathLoading, error: pathError } = useQuery({
    queryKey: ["initialPath"],
    queryFn: getInitialPath,
    staleTime: Infinity,
    select: (res) => { 
      if (res.error) throw res.error;
      return res.data ?? "."; }, // fallback to "."
  });

  // Create first tab when initialPath is ready
  useEffect(() => {
    if (!activeTab && initialPath) {
      createTab(initialPath);
    }
  }, [activeTab, initialPath, createTab]);


  useKeyboardShortcut({
    key: "t",
    ctrl: true,
    preventDefault: true,
    handler: async () => {
      const result = await getInitialPath();
      createTab(result.data ?? ".");
    },
  }); 

  
  // Show loading state
  if (pathLoading) return <div className="p-4 text-(--text-secondary)">Loading...</div>;
  if (pathError) return <div className="p-4 text-red-500">Error loading path: {pathError.message}</div>;
  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-screen w-screen bg-(--bg-primary) text-[--text-primary)] overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {tabs.length > 1 && <TabBar />}
          <FileManagerTab tab={activeTab} />
        </div>
      </div>
    </div>
  );
}
