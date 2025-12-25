import { FileList } from "./FileList";
import type { Pane, Tab } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { memo, useCallback, useMemo, useState } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useTabsStore } from "../store/tabsStore";
import { OpenFileWithDefaultApp } from "../../bindings/lazydir/internal/filemanagerservice";
import { PathBar } from "./PathBar";
import { formatSize } from "../utils/utils";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { FileGrid } from "./FileGrid";
import { useQuery } from "@tanstack/react-query";

interface FileManagerPaneProps {
  tab: Tab;
  pane: Pane;
}

const FileManagerPaneComponent = ({ tab, pane }: FileManagerPaneProps) => {
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const activatePane = useTabsStore((state) => state.activatePane);
  const navigateBack = useTabsStore((state) => state.paneNavigateBack);
  const navigateForward = useTabsStore((state) => state.paneNavigateForward);
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);

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

  const handlePathChange = useCallback(
    (newPath: string) => {
      updatePanePath(tab.id, pane.id, newPath);
      console.log("Path changed to:", newPath);
    },
    [tab.id, pane.id, updatePanePath]
  );

  const handleDirectoryOpen = useCallback(
    (file: FileInfo) => {
      if (!file.isDir) return;
      handlePathChange(file.path);
    },
    [handlePathChange]
  );

  const handleFileOpen = useCallback(async (file: FileInfo) => {
    if (file.isDir) return;

    const opened = await OpenFileWithDefaultApp(file.path);
    if (opened.error) {
      setFileOpenError(opened.error.message);
    }
  }, []);

  const handlePaneClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      activatePane(tab.id, pane.id);
    },
    [activatePane, tab.id, pane.id]
  );

  const canGoBack = useMemo(() => pane.historyIndex > 0, [pane.historyIndex]);
  const canGoForward = useMemo(
    () => pane.historyIndex < pane.history.length - 1,
    [pane.historyIndex, pane.history.length]
  );

  const handleNavigateUp = useCallback(() => {
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
  }, [pane.path, getPathInfo, getPathAtIndex, handlePathChange]);

  const handleNavigateBack = useCallback(() => {
    navigateBack(tab.id, pane.id);
  }, [navigateBack, tab.id, pane.id]);

  const handleNavigateForward = useCallback(() => {
    navigateForward(tab.id, pane.id);
  }, [navigateForward, tab.id, pane.id]);

  return (
    <div className="flex h-full" onClick={handlePaneClick}>
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center gap-1 px-2 py-1 bg-(--bg-primary) text-(--text-primary)">
          {/* Navigation Buttons */}
          <button
            className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
            disabled={!canGoBack}
            onClick={handleNavigateBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
            disabled={!canGoForward}
            onClick={handleNavigateForward}
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
            <FileList
              contents={contents}
              onDirectoryOpen={handleDirectoryOpen}
              onFileOpen={handleFileOpen}
              pane={pane}
              tab={tab}
            />

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
};

export const FileManagerPane = memo(FileManagerPaneComponent);
