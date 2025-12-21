import { useRef, useState, useEffect, useMemo } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { FileItem } from "./FileItem";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pane, Tab } from "../types";

interface FileGridProps {
  contents: DirectoryContents;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
  pane: Pane;
  tab: Tab;
}

export function FileGrid({
  contents,
  onDirectoryOpen,
  onFileOpen,
}: FileGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(8);

  // Since we are inside a pane, we can't rely based on window size
    // Adjust columns based on container width (Pane width)
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
  }, []);

  // Calculate items per "virtual row" (actually a slice of items)
  const itemsPerRow = cols;
  
  // Create rows of items for better batching
  const rows = useMemo(() => {
    const result = [];
    // Order by first directories, then files
    // TODO: Maybe to this server side?
    contents.files.sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });

    for (let i = 0; i < contents.files.length; i += itemsPerRow) {
      result.push(contents.files.slice(i, i + itemsPerRow));
    }
    return result;
  }, [contents.files, itemsPerRow]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

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
              {rowItems.map((file) => (
                <div key={file.path} className="p-2">
                  <FileItem
                    file={file}
                    isSelected={false}
                    onDirectoryOpen={onDirectoryOpen}
                    onFileOpen={onFileOpen}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}