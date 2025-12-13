import { useEffect } from "react";
import { FileManagerTab } from "./components/FileManagerTab";
import { Sidebar } from "./components/SideBar";
import { useTabsStore } from "./store/tabsStore";
import { TabBar } from "./components/TabBar";
import { PathBar } from "./components/PathBar";

function App() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());

  // Create initial tab once
  useEffect(() => {
    if (!activeTab) createTab("/");
  }, [activeTab, createTab]);

  if (!activeTab) return null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* TabBar at the very top */}

      {/* Main content area below TabBar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
        <PathBar />
          <TabBar />
          <FileManagerTab tab={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default App;
