import { useRef, useState, useEffect } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { FileItem } from "./FileItem";

export function FileGrid({
  contents,
  onDirectoryOpen,
  onFileOpen,
}: {
  contents: DirectoryContents;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null); // Reference to the grid container
  const [cols, setCols] = useState(8); // Number of columns, default 8

  useEffect(() => {
    const updateCols = () => {
      if (!gridRef.current) return; // Ensure the ref is available
      const width = gridRef.current.offsetWidth; // Measure the current pane width

      // Decide number of columns based on the pane's width
      if (width < 300) setCols(1); // Very narrow pane → 1 column
      else if (width < 600) setCols(4); // Medium pane → 4 columns
      else setCols(8); // Wide pane → 8 columns
    };

    updateCols(); // Run on mount

    // Listen for window resize to adjust columns dynamically
    window.addEventListener("resize", updateCols);

    // Clean up listener when component unmounts
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  return (
    <div className="flex-1 overflow-auto">
      <div
        ref={gridRef}
        className="grid gap-4 p-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {contents.files.map((file) => (
          <FileItem
            key={file.path}
            file={file}
            isSelected={false}
            onDirectoryOpen={onDirectoryOpen}
            onFileOpen={onFileOpen}
          />
        ))}
      </div>
    </div>
  );
}
