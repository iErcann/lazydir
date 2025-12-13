import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { FileItem } from "./FileItem";
import { useVirtualizer } from "@tanstack/react-virtual";

export function FileGrid({
  contents,
  onDirectoryOpen,
  onFileOpen,
}: {
  contents: DirectoryContents;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}) {
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

  // Compute number of rows based on columns
  const rows = useMemo(() => Math.ceil(contents.files.length / cols), [
    contents.files.length,
    cols,
  ]);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => gridRef.current,
    estimateSize: () => 120, // row height
    gap: 32,
  });

  const getFileAt = useCallback(
    (rowIndex: number, colIndex: number) => {
      const index = rowIndex * cols + colIndex;
      return contents.files[index];
    },
    [contents.files, cols]
  );

  return (
    <div className="flex-1 overflow-auto" ref={gridRef}>
      <div
        className="relative"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full grid gap-0 p-0 box-border"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: cols }).map((_, colIndex) => {
              const file = getFileAt(virtualRow.index, colIndex);
              if (!file) return null;
              return (
                <FileItem
                  key={file.path}
                  file={file}
                  isSelected={false}
                  onDirectoryOpen={onDirectoryOpen}
                  onFileOpen={onFileOpen}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
