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
  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-8 gap-4 p-4">
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
