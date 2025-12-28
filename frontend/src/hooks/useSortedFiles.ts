import { useMemo } from "react";
import { FileInfo } from "../../bindings/lazydir/internal";

export function useSortedFiles(files: FileInfo[]) {
  return useMemo(() => {
    // Order by first directories, then files
    return [...files].sort((a, b) => {
      if (a.isDir && !b.isDir) return -1;
      if (!a.isDir && b.isDir) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [files]);
}
