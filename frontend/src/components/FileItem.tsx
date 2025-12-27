import { Folder } from "lucide-react";
import { FileInfo } from "../../bindings/lazydir/internal";
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

  // Truncate filename: keep beginning + ... + end  (example: verylongfi...lename.txt)
  const maxLength = 34;

  const truncate = (name: string): string => {
    if (name.length <= maxLength) return name;

    const extIndex = name.lastIndexOf(".");
    if (extIndex <= 0 || extIndex >= name.length - 1) {
      // No extension or weird name → just cut in middle
      const half = Math.floor(maxLength / 2);
      return name.slice(0, half) + "..." + name.slice(-half);
    }

    const namePart = name.slice(0, extIndex);
    const ext = name.slice(extIndex);

    const charsForName = maxLength - ext.length - 3; // 3 for "..."
    if (charsForName <= 6) {
      // Very long extension or tiny space → simple truncate
      return name.slice(0, maxLength - 3) + "...";
    }

    return namePart.slice(0, charsForName) + "..." + ext;
  };

  return (
    <div
      onClick={() => onSelect(file)}
      onDoubleClick={() => onOpen(file)}
      className={`flex flex-col items-center rounded-lg select-none   ${
        isSelected
          ? "bg-blue-600 ring-2 ring-blue-500"
          : "hover:bg-(--bg-tertiary)"
      }`}
      title={file.name} // full name on hover
    >
      {file.isDir ? (
        <div className="text-(--accent) mb-2">
          <Folder className="w-16 h-16 fill-(--accent)" />
        </div>
      ) : (
        getIconForFile({
          fileName: file.name,
          className: "w-16 h-16 text-(--accent) mb-2",
        })
      )}

      <span
        className="text-xs text-center text-(--text-primary) w-full wrap-break-word line-clamp-3 min-h-10"
        title={file.name} // extra safety
      >
        {truncate(file.name)}
      </span>
    </div>
  );
}
