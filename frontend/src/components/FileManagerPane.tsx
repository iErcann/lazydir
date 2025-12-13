import { FileGrid } from "./FileGrid";
import type { Pane, Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";
import { PathBar } from "./PathBar";

export function FileManagerPane({ tab, pane }: { tab: Tab; pane: Pane }) {
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const activatePane = useTabsStore((state) => state.activatePane);

  // Load directory contents
  // Contains the files, putten here to avoid rerendering everything if inside zustand
  const [contents, setContents] = useState<DirectoryContents | null>(null);

  useEffect(() => {
    loadDirectory(pane.path).then((data) => setContents(data));
  }, [pane.path, loadDirectory]);

  const handleDirectoryOpen = (file: FileInfo) => {
    if (!file.isDir) return;
    handlePathChange(file.path);
  };

  const handlePathChange = (newPath: string) => {
    console.log("Changing path to:", newPath);
    updatePanePath(tab.id, pane.id, newPath);
  }

  const handleFileOpen = (file: FileInfo) => {
    if (file.isDir) return;
    OpenFileWithDefaultApp(file.path);
  };

  const handlePaneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    activatePane(tab.id, pane.id);
  };

  if (!contents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full" onClick={handlePaneClick}>
      <div className="flex-1 flex flex-col">
        <PathBar pane={pane} onPathChange={handlePathChange} />
        <FileGrid
          contents={contents}
          onDirectoryOpen={handleDirectoryOpen}
          onFileOpen={handleFileOpen}
        />
      </div>
    </div>
  );
}
