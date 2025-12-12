import { FileManager } from "./FileManager";
import type { Pane } from "../types";
import { useFileSystemStore } from "../store/directoryStore";
import { useEffect, useState } from "react";
import { DirectoryContents } from "../../bindings/lazydir/internal";
import React from "react";

/**
 * Single pane representation
 */
export function FileManagerPane({ pane }: { pane: Pane }) {
  const { loadDirectory } = useFileSystemStore();

  // Load directory contents
  // Contains the files, putten here to avoid rerendering everything if inside zustand
  const [contents, setContents] = useState<DirectoryContents | null>(
    null
  );
  
  useEffect(() => {
    loadDirectory(pane.path).then((data) => setContents(data));
  }, [pane.path, loadDirectory]);

  if (!contents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <FileManager contents={contents} />
      </div>
    </div>
  );
}
