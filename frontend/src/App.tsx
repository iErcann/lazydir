import { useEffect } from "react";
import { FileManagerTab } from "./components/FileManagerTab";
import { Sidebar } from "./components/SideBar";
import { useTabsStore } from "./store/tabsStore";
import { useFileSystemStore } from "./store/directoryStore";
import { TabBar } from "./components/TabBar";
// import { useKeyboardShortcut } from "./hooks/usekeyboardShortcut";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const getOperatingSystem = useFileSystemStore(
    (state) => state.getOperatingSystem
  );
  const getInitialPath = useFileSystemStore((state) => state.getInitialPath);
  const tabs = useTabsStore((state) => state.tabs);

  useEffect(() => {
    // Fetch OS and create initial tab once
    getOperatingSystem();
    if (!activeTab) {
      getInitialPath().then((result) => {
        if (result.data) {
          createTab(result.data);
        } else {
          createTab("."); // Fallback to current directory
        }
      });
    }
  }, [getOperatingSystem, getInitialPath, createTab, activeTab]);

  if (!activeTab) return null;

  // useKeyboardShortcut({
  //   key: "t",
  //   ctrl: true,
  //   preventDefault: true,
  //   handler: async () => {
  //     const result = await getInitialPath();
  //     createTab(result.data ?? ".");
  //   },
  // }); breaks rule of hooks?

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen w-screen bg-(--bg-primary) text-[--text-primary)] overflow-hidden">
        {/* Main content area below TabBar */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {tabs.length > 1 && <TabBar />}
            <FileManagerTab tab={activeTab} />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
