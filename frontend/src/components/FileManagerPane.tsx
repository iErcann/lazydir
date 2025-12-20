import { FileList } from "./FileList";
import type { Pane, Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";
import { PathBar } from "./PathBar";
import { formatSize } from "../utils/utils";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

interface FileManagerPaneProps {
  tab: Tab;
  pane: Pane;
}
export function FileManagerPane({ tab, pane }: FileManagerPaneProps) {
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
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

  console.log("Rendering FileManagerPane for path:", pane.path);

  return (
    <div className="flex h-full" onClick={handlePaneClick}>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-1 px-2 py-1 bg-(--bg-primary)  ">
          {/* <button className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-40">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded hover:bg-[var(--bg-secondary)] disabled:opacity-40">
            <ArrowRight className="w-4 h-4" />
          </button>

          <button className="p-1.5 rounded hover:bg-[var(--bg-secondary)]">
            <ArrowUp className="w-4 h-4" />
          </button> */}

          <div className="flex-1 flex flex-col">
            <PathBar pane={pane} onPathChange={handlePathChange} />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4">
            <div className="bg-(--accent) text-(--text-primary) p-2 rounded">
              Error: {error}
            </div>
          </div>
        )}

        {/* Loading state */}
        {!error && !contents && (
          <div className="p-2  text-(--text-secondary)"> </div>
        )}

        {/* Directory contents */}
        {contents && (
          <div className="flex-1 flex flex-col overflow-hidden px-4">
            <FileList
              contents={contents}
              onDirectoryOpen={handleDirectoryOpen}
              onFileOpen={handleFileOpen}
              pane={pane}
              tab={tab}
            />

            <div className="p-2 text-sm text-(--text-secondary) tracking-wide bg-(--bg-primary) truncate">
              {contents.files.filter((f) => f.isDir).length} folders |{" "}
              {contents.files.filter((f) => !f.isDir).length} files :{" "}
              {formatSize(calculateDirectorySize(contents))} (
              {calculateDirectorySize(contents).toLocaleString()} bytes)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
