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
import { FileGrid } from "./FileGrid";
import { useQuery } from "@tanstack/react-query";

interface FileManagerPaneProps {
  tab: Tab;
  pane: Pane;
}
export function FileManagerPane({ tab, pane }: FileManagerPaneProps) {
  const loadDirectory = useFileSystemStore((state) => state.loadDirectory);
  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const activatePane = useTabsStore((state) => state.activatePane);
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
        {(fileOpenError || error) && (
          <div className="p-4">
            <div className="bg-(--bg-tertiary) text-(--text-primary) p-4 rounded-md">
              Error: {fileOpenError || error?.message}
            </div>
          </div>
        )}

        {/* Loading state */}
        {(isLoading || isFetching) && (
          <div className="p-2  text-(--text-secondary)"> </div>
        )}

        {/* Directory contents */}
        {!(fileOpenError || error) && contents && (
          <div className="flex-1 flex flex-col overflow-hidden px-4">
            <FileList
              contents={contents}
              onDirectoryOpen={handleDirectoryOpen}
              onFileOpen={handleFileOpen}
              pane={pane}
              tab={tab}
            />

            <div className="p-2 text-sm text-(--text-secondary)">
              {/* always use folders for the front users, but dir in the code. */}
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
