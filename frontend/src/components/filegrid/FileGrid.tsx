import { useRef, useMemo, useState, useEffect } from "react";
import { FileItem } from "./FileItem";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DirectoryContents,
  FileInfo,
} from "../../../bindings/lazydir/internal";
import { useFileContextMenu } from "../../hooks/useFileContextMenu";
import { useTabsStore } from "../../store/tabsStore";
import { Pane, Tab } from "../../types";
import { useSortedFiles } from "../../hooks/useSortedFiles";

interface FileGridProps {
  contents: DirectoryContents;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
  paneId: string;
  tabId: string;
}

export function FileGrid({
  contents,
  onDirectoryOpen,
  onFileOpen,
  paneId,
  tabId,
}: FileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  // Sort files: directories first, then files
  const sortedFiles = useSortedFiles(contents.files);

  // Since we are inside a pane, we can't rely based on window size
  // Adjust columns based on container width (Pane width)
  // Also to force a re-render we throw window resize events
  const [cols, setCols] = useState(8);

  useEffect(() => {
    const updateCols = () => {
      if (!gridRef.current) return;
      const width = gridRef.current.offsetWidth;

      if (width < 300) setCols(1);
      else if (width < 600) setCols(4);
      else setCols(8);
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, [gridRef]);

  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tabId, paneId)?.selectedFilePaths
  );

  const setSelectedFilePaths = useTabsStore(
    (state) => state.setSelectedFilePaths
  );

  // Calculate items per "virtual row" (actually a slice of items)
  const itemsPerRow = cols;

  // Create rows of items for better batching
  const rows = useMemo(() => {
    const result = [];
    // TODO: Maybe do this server side?
    for (let i = 0; i < sortedFiles.length; i += itemsPerRow) {
      result.push(sortedFiles.slice(i, i + itemsPerRow));
    }
    return result;
  }, [sortedFiles, itemsPerRow]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  const onOpen = (file: FileInfo) => {
    if (file.isDir) {
      onDirectoryOpen(file);
    } else {
      onFileOpen(file);
    }
  };

  const handleFileClick = (file: FileInfo, e: React.MouseEvent) => {
    const newSelected: Set<string> = new Set(selectedFilePaths);

    const isMultiSelect = e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on Mac

    if (isMultiSelect) {
      // Toggle selection if Ctrl/Cmd is pressed
      if (newSelected.has(file.path)) {
        newSelected.delete(file.path);
      } else {
        newSelected.add(file.path);
      }
    } else {
      // Single select: clear all others and select only this file
      newSelected.clear();
      newSelected.add(file.path);
    }

    setSelectedFilePaths(tabId, paneId, newSelected);
  };

  return (
    <div className="flex-1 overflow-auto p-2" ref={gridRef}>
      <div
        className="relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full grid gap-0 p-0 box-border"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((file) => {
                return (
                  <div key={file.path} className="p-2">
                    <FileItem
                      file={file}
                      onDirectoryOpen={onDirectoryOpen}
                      onFileOpen={onFileOpen}
                      onClick={handleFileClick}
                      paneId={paneId}
                      tabId={tabId}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
