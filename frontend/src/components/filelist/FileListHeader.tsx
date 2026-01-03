import React from "react";
import { Table, flexRender } from "@tanstack/react-table";
import { FileInfo } from "../../../bindings/lazydir/internal";

interface FileListHeaderProps {
  table: Table<FileInfo>;
  gridCols: string;
}

export function FileListHeader({ table, gridCols }: FileListHeaderProps) {
  return (
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
                  header.column.getCanSort() ? "cursor-pointer select-none" : ""
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
  );
}
