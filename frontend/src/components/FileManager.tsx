import React from "react";
import { DirectoryContents } from "../../bindings/lazydir/internal";
import { FileItem } from "./FileItem";

// Stateless component for rendering file manager grid
export function FileManager({
  contents,
}: {
  contents: DirectoryContents;
}) {
  // Just the grid rendering logic from your original code
  // No state, just presentation
  return (
    <div className="grid grid-cols-8 gap-4 p-4">
      {contents.files.map((file) => (
        <FileItem key={file.path} file={file} isSelected={false} />
      ))}
    </div>
  );
}
