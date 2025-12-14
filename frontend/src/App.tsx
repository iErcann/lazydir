import { useEffect } from "react";
import { FileManagerTab } from "./components/FileManagerTab";
import { Sidebar } from "./components/SideBar";
import { useTabsStore } from "./store/tabsStore";
import { TabBar } from "./components/TabBar";
import { useFileSystemStore } from "./store/directoryStore";

function App() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());
  const getOperatingSystem = useFileSystemStore((state) => state.getOperatingSystem);

  useEffect(() => {
    // Fetch OS and create initial tab once
    getOperatingSystem(); 
    if (!activeTab) {
      createTab("/");
    }
  }, [getOperatingSystem, createTab, activeTab]);

  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Main content area below TabBar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <TabBar /> Only render this when tabs.length > 1 */}
          <FileManagerTab tab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default App;
