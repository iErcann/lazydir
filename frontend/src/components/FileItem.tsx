import {
  Folder,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
} from "lucide-react";
import { FileInfo } from "../../bindings/lazydir/internal";
import { formatSize } from "../utils/utils";
import { getIconForFile } from "@react-symbols/icons/utils";

interface FileItemProps {
  file: FileInfo;
  isSelected: boolean;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}

export function FileItem({
  file,
  isSelected,
  onDirectoryOpen,
  onFileOpen,
}: FileItemProps) {
  const onSelect = (file: FileInfo) => {
    console.log("Select file or directory:", file.path);
  };
  const onOpen = (file: FileInfo) => {
    if (file.isDir) {
      onDirectoryOpen(file);
    } else {
      onFileOpen(file);
    }
  };
  return (
    <div
      onClick={() => onSelect(file)}
      onDoubleClick={() => onOpen(file)}
      className={`flex flex-col items-center rounded-lg select-none  ${
        isSelected
          ? "bg-blue-600 ring-2 ring-blue-500"
          : "hover:bg-(--bg-tertiary)"
      }`}
      title={file.name}
    >
      {file.isDir ? (
        <div className="text-(--accent) mb-2 ">
          <Folder className="w-16 h-16 fill-(--accent)" />
        </div>
      ) : (
        getIconForFile({
          fileName: `${file.name}`,
          className: "w-16 h-16 text-(--accent) mb-2 ",
        })
      )}

      <span className="text-xs text-center text-(--text-primary) w-full break-words line-clamp-2 ">
        {file.name}
      </span>
    </div>
  );
}
