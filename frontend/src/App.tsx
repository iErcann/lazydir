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
    <div className="flex h-full w-full bg-zinc-900 text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <FileManagerTab tab={activeTab} />
      </div>
    </div>
  );
}

export default App;
