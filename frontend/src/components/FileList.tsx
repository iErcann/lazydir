import { useRef, useMemo } from "react";
import { DirectoryContents, FileInfo } from "../../bindings/lazydir/internal";
import { useVirtualizer } from "@tanstack/react-virtual";
import { File, Folder } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

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
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const columns = useMemo<ColumnDef<FileInfo>[]>(
    () => [
      {
        id: "icon",
        header: "",
        cell: ({ row }) => (
          <div className="w-8 flex items-center justify-center">
            {row.original.isDir ? (
              <Folder className="w-5 h-5" style={{ color: "var(--accent)" }} />
            ) : (
              <File
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>
        ),
        enableSorting: false,
        size: 32,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <div className="truncate text-sm font-medium">
            {getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: "modified",
        header: "Modified",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return (
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {value ? formatDate(value) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row, getValue }) => (
          <div
            className="text-sm text-right"
            style={{ color: "var(--text-secondary)" }}
          >
            {row.original.isDir ? "-" : formatSize(getValue() as number)}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: contents.files,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const onOpen = (file: FileInfo) => {
    if (file.isDir) {
      onDirectoryOpen(file);
    } else {
      onFileOpen(file);
    }
  };

  return (
    <div className="flex-1 overflow-auto" ref={listRef}>
      <div className="min-w-[600px]">
        {/* Header */}
        <div
          className="sticky top-0 px-4 py-2 grid grid-cols-[auto_2fr_1fr_1fr] gap-4 text-sm font-medium border-b"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            borderColor: "var(--bg-tertiary)",
            zIndex: 1,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : ""
                  }
                  onClick={header.column.getToggleSortingHandler()}
                  title={
                    header.column.getCanSort()
                      ? header.column.getNextSortingOrder() === "asc"
                        ? "Sort ascending"
                        : header.column.getNextSortingOrder() === "desc"
                        ? "Sort descending"
                        : "Clear sort"
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {
                    {
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string]
                  }
                </div>
              ))}
            </>
          ))}
        </div>

        {/* Virtual rows */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            const file = row.original;

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
                  onDoubleClick={() => {
                    onOpen(file);
                  }}
                  className="w-full px-4 py-4 grid grid-cols-[auto_2fr_1fr_1fr] gap-4 items-center text-left border-b"
                  style={{
                    borderColor: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  ))}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
