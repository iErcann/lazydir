import { FileGrid } from "./FileGrid";
import type { Pane, Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";

export function FileManagerPane({ tab, pane }: { tab: Tab, pane: Pane }) {
  const { loadDirectory } = useFileSystemStore();
  const {  updatePanePath } = useTabsStore();

  // Load directory contents
  // Contains the files, putten here to avoid rerendering everything if inside zustand
  const [contents, setContents] = useState<DirectoryContents | null>(
    null
  );

  useEffect(() => {
    loadDirectory(pane.path).then((data) => setContents(data));
  }, [pane.path, loadDirectory]);

  const handleDirectoryOpen = (file: FileInfo) => {
    if (!file.isDir) return;
    updatePanePath(tab.id, pane.id, file.path);
  };

  const handleFileOpen = (file: FileInfo) => {  
    if (file.isDir) return;
    OpenFileWithDefaultApp(file.path);
  }

  if (!contents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <FileGrid contents={contents} onDirectoryOpen={handleDirectoryOpen} onFileOpen={handleFileOpen} />
      </div>
    </div>
  );
}
