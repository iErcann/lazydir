import { useEffect } from "react";
import { FileManagerTab } from "./components/FileManagerTab";
import { Sidebar } from "./components/SideBar";
import { useTabsStore } from "./store/tabsStore";
import { useFileSystemStore } from "./store/directoryStore";
import { TabBar } from "./components/TabBar";

function App() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const getOperatingSystem = useFileSystemStore((state) => state.getOperatingSystem);
  const getInitialPath = useFileSystemStore((state) => state.getInitialPath);
  
  useEffect(() => {
    // Fetch OS and create initial tab once
    getOperatingSystem(); 
    if (!activeTab) {
      getInitialPath().then(result => {
        if (result.data) {
          createTab(result.data);
        } else {
          createTab("."); // Fallback to current directory
        }
      });
    }
  }, [getOperatingSystem, getInitialPath, createTab, activeTab]);

  if (!activeTab) return null;

  return (
    <div className=" flex flex-col h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Main content area below TabBar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabBar /> {/*  Only render this when tabs.length > 1 */}
          <FileManagerTab tab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default App;
