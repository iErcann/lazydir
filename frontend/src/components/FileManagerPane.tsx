import { FileList } from "./FileList";
import { ViewMode, type Pane, type Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";
import { PathBar } from "./PathBar";
import { formatSize } from "../utils/utils";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { FileGrid } from "./FileGrid";
import { useQuery } from "@tanstack/react-query";
import { List, Grid } from "lucide-react"; // add to your imports

interface FileManagerPaneProps {
  tab: Tab;
  pane: Pane;
}
export function FileManagerPane({ tab, pane }: FileManagerPaneProps) {
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const activatePane = useTabsStore((state) => state.activatePane);
  const navigateBack = useTabsStore((state) => state.paneNavigateBack);
  const navigateForward = useTabsStore((state) => state.paneNavigateForward);
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);
  const setPaneViewMode = useTabsStore((state) => state.setPaneViewMode);
  const {
    data: contents,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["directory", pane.path],

    queryFn: () => loadDirectory(pane.path),

    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });

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
      setFileOpenError(opened.error.message);
    }
  };

  const handlePaneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    activatePane(tab.id, pane.id);
  };

  const canGoBack = pane.historyIndex > 0;
  const canGoForward = pane.historyIndex < pane.history.length - 1;

  const handleNavigateUp = () => {
    getPathInfo(pane.path).then((result) => {
      if (result.error || !result.data) return;
      const pathInfo = result.data;
      const parentIndex = pathInfo.parts.length - 2; // parent is one level up
      if (parentIndex < 0) return; // already at root

      getPathAtIndex(pathInfo.fullPath, parentIndex).then((res) => {
        if (res.error || !res.data) return;
        const parentPath = res.data;
        handlePathChange(parentPath);
      });
    });
  };

  return (
    <div className="flex h-full" onClick={handlePaneClick}>
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-(--bg-primary) text-(--text-primary)">
          {/* Navigation Buttons */}
          <button
            className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
            disabled={!canGoBack}
            onClick={() => navigateBack(tab.id, pane.id)}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
            disabled={!canGoForward}
            onClick={() => navigateForward(tab.id, pane.id)}
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            className="p-1 rounded hover:bg-(--bg-secondary) transition"
            onClick={handleNavigateUp}
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Path Bar */}
          <div className="flex-1 ml-1">
            <PathBar pane={pane} onPathChange={handlePathChange} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 ml-2">
            <button
              className={`
                p-1 rounded hover:bg-(--bg-secondary) transition
                ${pane.viewMode === ViewMode.LIST ? "bg-(--bg-accent)" : ""}
              `}
              onClick={() => setPaneViewMode(tab.id, pane.id, ViewMode.LIST)}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={`
                p-1 rounded hover:bg-(--bg-secondary) transition
                ${pane.viewMode === ViewMode.GRID ? "bg-(--bg-accent)" : ""}
              `}
              onClick={() => setPaneViewMode(tab.id, pane.id, ViewMode.GRID)}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error message */}
        {(fileOpenError || error) && (
          <div className="p-2">
            <div className="bg-(--bg-tertiary) text-(--text-primary) p-2 rounded-md">
              Error: {fileOpenError || error?.message}
            </div>
          </div>
        )}

        {/* Loading state */}
        {(isLoading || isFetching) && (
          <div className="p-1 text-(--text-secondary)"> </div>
        )}

        {/* Directory contents */}
        {!(fileOpenError || error) && contents && (
          <div className="flex-1 flex flex-col overflow-hidden px-2">
            {pane.viewMode === ViewMode.GRID ? (
              <FileGrid
                contents={contents}
                onDirectoryOpen={handleDirectoryOpen}
                onFileOpen={handleFileOpen}
                pane={pane}
                tab={tab}
              />
            ) : (
              <FileList
                contents={contents}
                onDirectoryOpen={handleDirectoryOpen}
                onFileOpen={handleFileOpen}
                pane={pane}
                tab={tab}
              />
            )}
            <div className="p-1 text-xs text-(--text-secondary)">
              {contents.dirCount} folders | {contents.fileCount} files :{" "}
              {formatSize(contents.directSizeBytes)} (
              {contents.directSizeBytes.toLocaleString()} bytes)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
