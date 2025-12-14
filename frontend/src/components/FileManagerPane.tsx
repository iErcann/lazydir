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
  const [error, setError] = useState<string | null>(null);

  // Load directory contents
  // Contains the files, putten here to avoid rerendering everything if inside zustand
  const [contents, setContents] = useState<DirectoryContents | null>(null);

  useEffect(() => {
    const fetchDirectory = async () => {
      // Reset state before loading
      setError(null);
      setContents(null);

      try {
        const result = await loadDirectory(pane.path);
        if (result.error) {
          setError(result.error.message);
        } else if (result.data) {
          setContents(result.data);
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchDirectory();
  }, [pane.path, loadDirectory]);

  const handleDirectoryOpen = (file: FileInfo) => {
    if (!file.isDir) return;
    handlePathChange(file.path);
  };

  const handlePathChange = (newPath: string) => {
    updatePanePath(tab.id, pane.id, newPath);
    console.log("Path changed to:", newPath);
  };

  const handleFileOpen = async (file: FileInfo) => {
    if (file.isDir) return;
    const opened = await OpenFileWithDefaultApp(file.path);
    if (opened.error) {
      setError(opened.error.message);
    }
  };

  const handlePaneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    //activatePane(tab.id, pane.id);
  };

  // Size in bytes
  const calculateDirectorySize = (contents: DirectoryContents) => {
    return contents.files.reduce((total, file) => total + file.size, 0);
  };

  // Size in bytes to human readable
  const formatSize = (size: number) => {
    if (size === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return `${(size / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  console.log("Rendering FileManagerPane for path:", pane.path);

  return (
    <div className="flex h-full" onClick={handlePaneClick}>
      <div className="flex-1 flex flex-col">
        <PathBar pane={pane} onPathChange={handlePathChange} />

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-2 rounded">
            Error: {error}
          </div>
        )}

        {/* Loading state */}
        {!error && !contents && (
          <div className="p-2  text-[var(--text-secondary)]">Loading...</div>
        )}

        {/* Directory contents */}
        {contents && (
          <>
            <FileGrid
              contents={contents}
              onDirectoryOpen={handleDirectoryOpen}
              onFileOpen={handleFileOpen}
            />

            <div className="p-2 text-sm text-[var(--text-secondary)] tracking-wide bg-[var(--bg-secondary)] truncate">
              {contents.files.filter((f) => f.isDir).length} folders |{" "}
              {contents.files.filter((f) => !f.isDir).length} files :{" "}
              {formatSize(calculateDirectorySize(contents))} (
              {calculateDirectorySize(contents).toLocaleString()} bytes)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
