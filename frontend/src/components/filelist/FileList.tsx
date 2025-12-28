import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  DirectoryContents,
  FileInfo,
} from "../../../bindings/lazydir/internal";
import { useTabsStore } from "../../store/tabsStore";
import { useFileListColumns } from "../../hooks/useFileListColumns";
import { FileListHeader } from "./FileListHeader";
import { FileListRow } from "./FileListRow";

interface FileListProps {
  contents: DirectoryContents;
  paneId: string;
  tabId: string;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
}

export function FileList({
  contents,
  onDirectoryOpen,
  onFileOpen,
  paneId,
  tabId,
}: FileListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const pane = useTabsStore((state) => state.getPane(tabId, paneId)!);
  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tabId, paneId)?.selectedFilePaths
  );
  const setSelectedFilePaths = useTabsStore(
    (state) => state.setSelectedFilePaths
  );
  const setPaneSorting = useTabsStore((state) => state.setPaneSorting);

  const columns = useFileListColumns();

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
      setPaneSorting(tabId, paneId, nextSorting);
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

  const handleFileClick = (file: FileInfo, e: React.MouseEvent) => {
    const newSelected: Set<string> = new Set(selectedFilePaths);

    const isMultiSelect = e.ctrlKey || e.metaKey; // Ctrl on Windows/Linux, Cmd on Mac

    if (isMultiSelect) {
      // Toggle selection if Ctrl/Cmd is pressed
      if (newSelected.has(file.path)) {
        newSelected.delete(file.path);
      } else {
        newSelected.add(file.path);
      }
    } else {
      // Single select: clear all others and select only this file
      newSelected.clear();
      newSelected.add(file.path);
    }

    setSelectedFilePaths(tabId, paneId, newSelected);
  };

  const gridCols = "grid-cols-[minmax(240px,1fr)_90px_260px]";

  return (
    <div className="flex-1 overflow-auto" ref={listRef}>
      <div className="min-w-[600px]">
        <FileListHeader table={table} gridCols={gridCols} />

        {/* Virtual rows */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            return (
              <FileListRow
                key={virtualRow.key}
                virtualRow={virtualRow}
                row={rows[virtualRow.index]}
                file={rows[virtualRow.index].original}
                gridCols={gridCols}
                onOpen={onOpen}
                onClick={handleFileClick}
                paneId={paneId}
                tabId={tabId}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
