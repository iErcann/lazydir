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
import { useTabsStore } from "../store/tabsStore";
import { Pane, Tab } from "../types";
import { formatSize } from "../utils/utils";

interface FileListProps {
  contents: DirectoryContents;
  pane: Pane;
  tab: Tab;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}
export function FileList({
  contents,
  onDirectoryOpen,
  onFileOpen,
  pane,
  tab,
}: FileListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([
    // TODO: use the store pan instead. this will make us lose sorting on pane switch
    { id: "name", desc: false },
  ]);

  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tab.id, pane.id)?.selectedFilePaths
  );

  const setSelectedFilePaths = useTabsStore(
    (state) => state.setSelectedFilePaths
  );

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
              <Folder className="w-5 h-5 text-[var(--accent)]" />
            ) : (
              <File className="w-5 h-5 text-[var(--text-secondary)]" />
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
          <div
            className="truncate text-sm font-medium"
            title={getValue() as string}
          >
            {getValue() as string}
          </div>
        ),
        sortDescFirst: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original;
          const b = rowB.original;

          const getPriority = (item: FileInfo) => {
            const isDot = item.name.startsWith(".");

            if (item.isDir) {
              return isDot ? 2 : 1; // dirs: normal → dot
            } else {
              return isDot ? 4 : 3; // files: normal → dot
            }
          };

          const priorityA = getPriority(a);
          const priorityB = getPriority(b);

          // 1️⃣ Sort by type / dot priority
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // 2️⃣ Same group → alphabetical
          return a.name.localeCompare(b.name);
        },
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row, getValue }) => (
          <div className="text-sm text-[var(--text-secondary)]">
            {row.original.isDir ? "-" : formatSize(getValue() as number)}
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.original;
          const b = rowB.original;

          // Directories always go last (or first depending on sort order)
          if (a.isDir && !b.isDir) return 1;
          if (!a.isDir && b.isDir) return -1;

          // Both are files, sort by size
          return a.size - b.size;
        },
      },
      {
        accessorKey: "modified",
        header: "Modified",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return (
            <div className="text-sm text-[var(--text-secondary)]">
              {value ? formatDate(value) : "-"}
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.modified;
          const b = rowB.original.modified;

          if (!a && !b) return 0;
          if (!a) return 1;
          if (!b) return -1;

          return new Date(a).getTime() - new Date(b).getTime();
        },
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
    enableColumnResizing: true,
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

  const gridCols = "grid-cols-[32px_minmax(240px,1fr)_90px_160px]";

  return (
    <div className="flex-1 overflow-auto" ref={listRef}>
      <div className="min-w-[600px] px-6 py-2">
        {/* Header */}
        <div
          className={`sticky top-0 px-1 py-2 grid ${gridCols} gap-4 text-sm font-medium bg-[var(--bg-primary)] bg-opacity-100 z-10 w-full`}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={`
                    text-[var(--text-secondary)]
                    ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                      `}
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
            const isDir = file.isDir;

            return (
              <div
                key={virtualRow.key}
                className={`absolute top-0 left-0 w-full hover:bg-[var(--bg-secondary)] rounded-md`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  onDoubleClick={() => onOpen(file)}
                  onClick={() => {
                    const newSelected: Set<string> = new Set(selectedFilePaths);
                    if (newSelected.has(file.path)) {
                      newSelected.delete(file.path);
                    } else {
                      newSelected.add(file.path);
                    }
                    setSelectedFilePaths(tab.id, pane.id, newSelected);
                  }}
                  className={`w-full px-1 py-4 grid ${gridCols} gap-4 items-center text-left min-w-0 w-full rounded-b-md ${
                    selectedFilePaths?.has(file.path)
                      ? "bg-[var(--bg-tertiary)]"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="min-w-0 text-left">
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
