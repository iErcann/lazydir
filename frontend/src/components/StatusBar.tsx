import { useTabsStore } from '../store/tabsStore';
import { formatSize } from '../utils/utils';
import { DirectoryContents } from '../../bindings/lazydir/internal';

interface StatusBarProps {
  tabId: string;
  paneId: string;
  contents?: DirectoryContents;
}

export function StatusBar({ tabId, paneId, contents }: StatusBarProps) {
  const statusMessage = useTabsStore((state) => state.getPane(tabId, paneId)?.statusMessage);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-1 px-3 text-xs text-(--text-secondary) bg-(--bg-primary) border-t border-(--bg-tertiary) z-10">
      {statusMessage ? (
        <span className="text-(--accent)">{statusMessage}</span>
      ) : contents ? (
        <>
          {contents.dirCount} folders | {contents.fileCount} files :{' '}
          {formatSize(contents.directSizeBytes)} ({contents.directSizeBytes.toLocaleString()} bytes)
        </>
      ) : null}
    </div>
  );
}
