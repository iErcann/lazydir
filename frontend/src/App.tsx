import { useEffect } from "react";
import { FileManagerTab } from "./components/FileManagerTab";
import { Sidebar } from "./components/SideBar";
import { useTabsStore } from "./store/tabsStore";

function App() {
  const createTab = useTabsStore((state) => state.createTab);
  const activeTab = useTabsStore((state) => state.getActiveTab());

  // Create initial tab once
  useEffect(() => {
    if (!activeTab) createTab("/");
  }, [activeTab, createTab]);

  if (!activeTab) return null;
 
  return (
    <div className="flex h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <FileManagerTab tab={activeTab} />
      </div>
    </div>
  );
}

export default App;
