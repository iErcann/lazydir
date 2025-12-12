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

interface FileItemProps {
  file: FileInfo;
  isSelected: boolean;
}

export function FileItem({ file, isSelected }: FileItemProps) {
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file: FileInfo) => {
    if (file.isDir) return Folder;

    // TODO: move this to the backend.
    const ext = file.extension?.toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".svg"].includes(ext || ""))
      return Image;
    if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext || "")) return Film;
    if ([".mp3", ".wav", ".flac", ".m4a"].includes(ext || "")) return Music;
    if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext || ""))
      return Archive;
    if ([".txt", ".md", ".doc", ".docx", ".pdf"].includes(ext || ""))
      return FileText;

    return File;
  };

  const Icon = getFileIcon(file);

  const onSelect = (file: FileInfo) => {
    console.log("Select file or directory:", file.path);
  };
  const onOpen = (file: FileInfo) => {
    console.log("Open file or directory:", file.path);
  };
  return (
    <div
      onClick={() => onSelect(file)}
      onDoubleClick={() => onOpen(file)}
      className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
        isSelected ? "bg-blue-600 ring-2 ring-blue-500" : "hover:bg-[var(--bg-tertiary)]"
      }`}
    >
      <Icon
        className={`w-16 h-16 mb-2 ${
          file.isDir ? "text-[var(--accent)]" : "text-gray-500"
        }`}
      />
      <span className="text-sm text-center text-gray-100 w-full break-words">
        {file.name}
      </span>
      {!file.isDir && (
        <span className="text-xs text-gray-500 mt-0.5">
          {formatSize(file.size)}
        </span>
      )}
    </div>
  );
}
