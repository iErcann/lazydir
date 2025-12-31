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
    <div className="absolute bottom-0 left-0 right-0 p-1 px-3 text-xs text-(--text-secondary) bg-(--bg-primary) border-t border-(--bg-tertiary) z-10 flex items-center justify-between gap-4">
      <div className="flex-1 truncate">
        {contents ? (
          <>
            {contents.dirCount} folders | {contents.fileCount} files :{' '}
            {formatSize(contents.directSizeBytes)} ({contents.directSizeBytes.toLocaleString()}{' '}
            bytes)
          </>
        ) : null}
      </div>
      {statusMessage && (
        <div className="text-(--text-primary) font-medium whitespace-nowrap pr-4">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
