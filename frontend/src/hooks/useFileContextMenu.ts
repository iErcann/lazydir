import { useTabsStore } from "../store/tabsStore";
import { useFileSystemStore } from "../store/directoryStore";
import { FileInfo } from "../../bindings/lazydir/internal";

interface UseFileContextMenuProps {
  file: FileInfo;
  selectedFilePaths: Set<string> | undefined;
  onOpen: (file: FileInfo) => void;
  onSelectFile?: (file: FileInfo) => void;
}

export function useFileContextMenu({
  file,
  selectedFilePaths,
  onOpen,
  onSelectFile,
}: UseFileContextMenuProps) {
  const createTab = useTabsStore((state) => state.createTab);
  const copyFiles = useTabsStore((state) => state.copyFiles);
  const pasteFiles = useFileSystemStore((state) => state.pasteFiles);
  const clipboard = useTabsStore((state) => state.clipboard);

  const handleContextOpen = () => {
    // if the file is not already selected, select it, otherwise keep the multi selection
    if (onSelectFile && !selectedFilePaths?.has(file.path)) {
      onSelectFile(file);
    }
  };

  const contextMenuItems = [
    {
      label: "Open",
      onClick: () => {
        onOpen(file);
      },
    },
    {
      label: "Open in New Tab",
      onClick: () => {
        createTab(file.isDir ? file.path : undefined);
      },
    },
    {
      label: "Delete",
      onClick: () => {
        // Add delete functionality here
      },
    },
    {
      label: "Rename",
      onClick: () => {
        // Add rename functionality here
      },
    },
    {
      label: "Copy",
      onClick: () => {
        // TODO: Copy all selected files, not just the right-clicked one
        copyFiles(Array.from(selectedFilePaths || []), false); // Copy into the store, just the paths
      },
    },
    {
      label: "Cut",
      onClick: () => {
        copyFiles(Array.from(selectedFilePaths || []), true);
      },
    },
    {
      label: "Paste",
      onClick: async () => {
        // Can only paste into directories
        if (!file.isDir) return;

        await pasteFiles(
          clipboard.filePaths,
          file.path, // Not the pane path, but the path of the directory we have the context opened on
          clipboard.cutMode
        );

        // TODO: CLEAR CLIPBOARD !!

        // Force a reload of the directory after pasting
        // onOpen(file);
      },
    },
    {
      label: "Properties",
      onClick: () => {
        // Add properties functionality here
      },
    },
  ];

  return {
    contextMenuItems,
    handleContextOpen,
  };
}
