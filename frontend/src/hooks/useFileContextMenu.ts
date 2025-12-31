import { useTabsStore } from '../store/tabsStore';
import { useFileSystemStore } from '../store/directoryStore';
import { AppError, FileInfo } from '../../bindings/lazydir/internal';

interface UseFileContextMenuProps {
  file: FileInfo;
  selectedFilePaths: Set<string> | undefined;
  onOpen: (file: FileInfo) => void;
  onSelectFile?: (file: FileInfo) => void;
  tabId: string;
  paneId: string;
}

export function useFileContextMenu({
  file,
  selectedFilePaths,
  onOpen,
  onSelectFile,
  tabId,
  paneId,
}: UseFileContextMenuProps) {
  const createTab = useTabsStore((state) => state.createTab);
  const copyFiles = useTabsStore((state) => state.copyFiles);
  const pasteFiles = useFileSystemStore((state) => state.pasteFiles);
  const deleteFiles = useFileSystemStore((state) => state.deleteFiles);
  const clipboard = useTabsStore((state) => state.clipboard);
  const showErrorDialog = useFileSystemStore((state) => state.showErrorDialog);
  const showQuestionDialog = useFileSystemStore((state) => state.showQuestionDialog);
  const clearClipboard = useTabsStore((state) => state.clearClipboard);
  const setPaneStatus = useTabsStore((state) => state.setPaneStatus);
  const refreshPane = useTabsStore((state) => state.refreshPane);
  const handleContextOpen = () => {
    // if the file is not already selected, select it, otherwise keep the multi selection
    if (onSelectFile && !selectedFilePaths?.has(file.path)) {
      onSelectFile(file);
    }
  };

  const contextMenuItems = [
    {
      label: 'Open',
      onClick: () => {
        onOpen(file);
      },
    },
    {
      label: 'Open in New Tab',
      onClick: () => {
        createTab(file.isDir ? file.path : undefined);
      },
    },
    {
      label: 'Delete',
      onClick: async () => {
        const files = Array.from(selectedFilePaths || []);
        const fileCount = files.length;

        // Native confirmation dialog
        const result = await showQuestionDialog(
          'Confirm Delete',
          `Are you sure you want to delete ${fileCount} ${
            fileCount === 1 ? 'item' : 'items'
          }? This action cannot be undone.`,
          ['Delete', 'Cancel'],
          'Cancel'
        );

        if (result !== 'Delete') return;

        setPaneStatus(
          tabId,
          paneId,
          `Deleting ${fileCount} ${fileCount === 1 ? 'item' : 'items'}...`
        );

        const deleteResult = await deleteFiles(files);

        if (deleteResult.error) {
          console.error(deleteResult);
          showErrorDialog('Delete Error', deleteResult.error.message);
          setPaneStatus(tabId, paneId, 'Delete failed');
        } else {
          refreshPane(tabId, paneId);
          setPaneStatus(
            tabId,
            paneId,
            `Deleted ${fileCount} ${fileCount === 1 ? 'item' : 'items'}`
          );
        }
      },
    },
    {
      label: 'Rename',
      onClick: () => {
        // Add rename functionality here
      },
    },
    {
      label: 'Copy',
      onClick: () => {
        const files = Array.from(selectedFilePaths || []);
        copyFiles(files, false);
        setPaneStatus(
          tabId,
          paneId,
          `Copied ${files.length} ${files.length === 1 ? 'item' : 'items'}`
        );
      },
    },
    {
      label: 'Cut',
      onClick: () => {
        const files = Array.from(selectedFilePaths || []);
        copyFiles(files, true);
        setPaneStatus(
          tabId,
          paneId,
          `Cut ${files.length} ${files.length === 1 ? 'item' : 'items'}`
        );
      },
    },
    {
      label: 'Paste',
      onClick: async () => {
        // Can only paste into directories
        if (!file.isDir) return;

        const fileCount = clipboard.filePaths.length;
        setPaneStatus(
          tabId,
          paneId,
          `Pasting ${fileCount} ${fileCount === 1 ? 'item' : 'items'}...`
        );

        const pasteResult = await pasteFiles(
          clipboard.filePaths,
          file.path, // Not the pane path, but the path of the directory we have the context opened on
          clipboard.cutMode
        );

        // TODO : Stream the progress from wails events.
        // Also could return the time taken and show that in the status (pasteFiles can return it)
        if (pasteResult.error) {
          console.error(pasteResult);
          showErrorDialog('Paste Error', pasteResult.error.message);
          setPaneStatus(tabId, paneId, 'Paste failed :(');
        } else {
          refreshPane(tabId, paneId);
          setPaneStatus(tabId, paneId, `Pasted ${fileCount} ${fileCount === 1 ? 'item' : 'items'}`);
        }

        clearClipboard();
      },
    },
    {
      label: 'Properties',
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
