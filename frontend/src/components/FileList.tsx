import { useRef } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useVirtualizer } from "@tanstack/react-virtual";
import { File, Folder } from "lucide-react";

export function FileList({
  contents,
  onDirectoryOpen,
  onFileOpen,
}: {
  contents: DirectoryContents;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: contents.files.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-auto" ref={listRef}>
      <div className="min-w-[600px]">
        {/* Header */}
        <div 
          className="sticky top-0 px-4 py-2 grid grid-cols-[auto_2fr_1fr_1fr] gap-4 text-sm font-medium border-b"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--bg-tertiary)',
          }}
        >
          <div className="w-8"></div>
          <div>Name</div>
          <div>Modified</div>
          <div className="text-right">Size</div>
        </div>

        {/* Virtual rows */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const file = contents.files[virtualRow.index];
            const isDir = file.isDir;

            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  onClick={() => {
                    if (isDir) {
                      onDirectoryOpen(file);
                    } else {
                      onFileOpen(file);
                    }
                  }}
                  className="w-full px-4 py-2 grid grid-cols-[auto_2fr_1fr_1fr] gap-4 items-center text-left   border-b"
                  style={{
                    borderColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-8 flex items-center justify-center">
                    {isDir ? (
                      <Folder className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    ) : (
                      <File className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <div className="truncate text-sm font-medium">
                    {file.name}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {file.modified ? formatDate(file.modified) : "-"}
                  </div>
                  <div className="text-sm text-right" style={{ color: 'var(--text-secondary)' }}>
                    {isDir ? "-" : formatSize(file.size)}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}