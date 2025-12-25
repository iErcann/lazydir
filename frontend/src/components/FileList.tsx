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
import { useTabsStore } from "../store/tabsStore";
import { Pane, Tab } from "../types";
import { formatSize } from "../utils/utils";
import { getIconForFile, getIconForFolder } from "@react-symbols/icons/utils";
import React from "react";

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

  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tab.id, pane.id)?.selectedFilePaths
  );

  console.log("Rendering", pane.id);

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
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-2 min-w-0 px-2">
            <div className="w-6 h-6 flex items-center justify-center  ">
              {row.original.isDir ? (
                <div className="w-6 h-6 text-(--accent)">
                  <Folder className="w-6 h-6 fill-(--accent)" />
                </div>
              ) : (
                <div className="w-6 h-6">
                  {getIconForFile({
                    fileName: `${getValue() as string}`,
                  })}
                </div>
              )}
            </div>

            <div
              className="truncate text-sm font-medium min-w-0"
              title={getValue() as string}
            >
              {getValue() as string}
            </div>
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
          <div className="text-sm text-(--text-secondary)">
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
            <div className="text-sm text-(--text-secondary)">
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
      sorting: pane.sorting,
    },
    onSortingChange: (updater) => {
      // `updater` can be EITHER:
      // 1) A SortingState value (e.g. [{ id: "name", desc: false }])
      // 2) A function that receives the previous SortingState and returns a new one
      //    (e.g. old => [{ id: "name", desc: true }])

      const nextSorting =
        // If TanStack gives us a function, call it with the current sorting
        typeof updater === "function"
          ? updater(pane.sorting)
          : // Otherwise, it's already the new sorting value
            updater;

      // Persist the resolved sorting state into our global tabs store
      // so this pane stays in sync with the table
      useTabsStore.getState().setPaneSorting(tab.id, pane.id, nextSorting);
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });
  const onOpen = (file: FileInfo) => {
    if (file.isDir) {
      onDirectoryOpen(file);
    } else {
      onFileOpen(file);
    }
  };

  const gridCols = "grid-cols-[minmax(240px,1fr)_90px_260px]";

  return (
    <div className="flex-1 overflow-auto" ref={listRef}>
      <div className="min-w-[600px]">
        {/* Header */}
        <div
          className={`sticky top-0 py-2 grid ${gridCols} text-sm font-medium bg-opacity-0 z-10 w-full bg-(--bg-primary) border-b border-white/5 px-2`}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={`
                  text-(--text-secondary) hover:text-(--text-primary)
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
            </React.Fragment>
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
                className={`absolute top-0 left-0 w-full rounded-md select-none`}
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
                  className={`w-full py-2 grid ${gridCols} items-center text-left min-w-0 w-full rounded-b-md  ${
                    selectedFilePaths?.has(file.path)
                      ? "bg-(--bg-tertiary)"
                      : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="min-w-0 text-left select-none text-(--text-primary)"
                    >
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
