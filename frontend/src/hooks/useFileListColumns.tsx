import { ColumnDef } from "@tanstack/react-table";
import { Folder } from "lucide-react";
import { FileInfo } from "../../bindings/lazydir/internal";
import { formatSize } from "../utils/utils";
import { getIconForFile } from "@react-symbols/icons/utils";
import { useMemo } from "react";

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

export function useFileListColumns() {
  const columns = useMemo<ColumnDef<FileInfo>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue, row }) => (
          <div className="flex items-center gap-2 min-w-0 px-2">
            <div className="w-6 h-6 flex items-center justify-center">
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

            if (item.isDir) return isDot ? 2 : 1;
            return isDot ? 4 : 3;
          };

          const priorityA = getPriority(a);
          const priorityB = getPriority(b);

          if (priorityA !== priorityB) return priorityA - priorityB;
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

          if (a.isDir && !b.isDir) return 1;
          if (!a.isDir && b.isDir) return -1;

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

  return columns;
}
