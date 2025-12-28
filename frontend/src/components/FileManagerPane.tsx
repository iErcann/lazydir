import { ViewMode, type Pane, type Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";
import { PathBar } from "./PathBar";
import { formatSize } from "../utils/utils";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { List, Grid } from "lucide-react"; // add to your imports
import { FileGrid } from "./filegrid/FileGrid";
import { FileList } from "./filelist/FileList";
import { FileInfo } from "../../bindings/lazydir/internal";

interface FileManagerPaneProps {
  tabId: string;
  paneId: string;
}
export function FileManagerPane({ tabId, paneId }: FileManagerPaneProps) {
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);

  // FileSystem actions
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);

  // Tabs/navigation actions
  // }));
  const pane = useTabsStore((state) => state.getPane(tabId, paneId)!);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const activatePane = useTabsStore((state) => state.activatePane);
  const paneNavigateBack = useTabsStore((state) => state.paneNavigateBack);
  const paneNavigateForward = useTabsStore(
    (state) => state.paneNavigateForward
  );
  const setPaneViewMode = useTabsStore((state) => state.setPaneViewMode);

  // Query directory contents
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
    updatePanePath(tabId, paneId, newPath);
  };

  const handleFileOpen = async (file: FileInfo) => {
    if (file.isDir) return;
    const opened = await OpenFileWithDefaultApp(file.path);
    if (opened.error) setFileOpenError(opened.error.message);
  };

  const handlePaneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    activatePane(tabId, paneId);
  };

  const canGoBack = pane.historyIndex > 0;
  const canGoForward = pane.historyIndex < pane.history.length - 1;

  const handleNavigateUp = () => {
    getPathInfo(pane.path).then((result) => {
      if (result.error || !result.data) return;
      const pathInfo = result.data;
      const parentIndex = pathInfo.parts.length - 2;
      if (parentIndex < 0) return;

      getPathAtIndex(pathInfo.fullPath, parentIndex).then((res) => {
        if (res.error || !res.data) return;
        handlePathChange(res.data);
      });
    });
  };

  return (
    <div className="grid grid-rows-[auto_1fr] h-full" onClick={handlePaneClick}>
      {/* Top Bar */}
      <div className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-1 px-2 py-1 bg-(--bg-primary) text-(--text-primary)">
        {/* Navigation Buttons */}
        <button
          className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
          disabled={!canGoBack}
          onClick={() => paneNavigateBack(tabId, paneId)}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
          disabled={!canGoForward}
          onClick={() => paneNavigateForward(tabId, paneId)}
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
        <div className="mx-1">
          <PathBar pane={pane} onPathChange={handlePathChange} />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            className={`p-1 rounded hover:bg-(--bg-secondary) transition ${
              pane.viewMode === ViewMode.LIST ? "bg-(--bg-accent)" : ""
            }`}
            onClick={() => setPaneViewMode(tabId, paneId, ViewMode.LIST)}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            className={`p-1 rounded hover:bg-(--bg-secondary) transition ${
              pane.viewMode === ViewMode.GRID ? "bg-(--bg-accent)" : ""
            }`}
            onClick={() => setPaneViewMode(tabId, paneId, ViewMode.GRID)}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col overflow-hidden px-2">
        {(fileOpenError || error) && (
          <div className="p-2 bg-(--bg-tertiary) text-(--text-primary) rounded-md">
            Error: {fileOpenError || error?.message}
          </div>
        )}

        {(isLoading || isFetching) && (
          <div className="p-1 text-(--text-secondary)"> </div>
        )}

        {contents && !(fileOpenError || error) && (
          <>
            {pane.viewMode === ViewMode.GRID ? (
              <FileGrid
                contents={contents}
                onDirectoryOpen={handleDirectoryOpen}
                onFileOpen={handleFileOpen}
                paneId={paneId}
                tabId={tabId}
              />
            ) : (
              <FileList
                contents={contents}
                onDirectoryOpen={handleDirectoryOpen}
                onFileOpen={handleFileOpen}
                paneId={paneId}
                tabId={tabId}
              />
            )}
            <div className="p-1 text-xs text-(--text-secondary)">
              {contents.dirCount} folders | {contents.fileCount} files :{" "}
              {formatSize(contents.directSizeBytes)} (
              {contents.directSizeBytes.toLocaleString()} bytes)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
