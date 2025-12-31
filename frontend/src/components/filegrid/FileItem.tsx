import { Folder } from 'lucide-react';
import { getIconForFile } from '@react-symbols/icons/utils';
import { FileInfo } from '../../../bindings/lazydir/internal';
import { ContextMenu } from '../ContextMenu';
import { useFileContextMenu } from '../../hooks/useFileContextMenu';
import { useTabsStore } from '../../store/tabsStore';

interface FileItemProps {
  file: FileInfo;
  onOpen: (file: FileInfo) => void;
  onClick?: (file: FileInfo, e: React.MouseEvent) => void;
  paneId: string;
  tabId: string;
}

export function FileItem({ file, onOpen, onClick, paneId, tabId }: FileItemProps) {
  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tabId, paneId)?.selectedFilePaths
  );

  const isSelected = selectedFilePaths?.has(file.path);

  const { contextMenuItems, handleContextOpen } = useFileContextMenu({
    file,
    selectedFilePaths,
    onOpen,
  });

  // Truncate filename: keep beginning + ... + end  (example: verylongfi...lename.txt)
  const maxLength = 34;

  const truncate = (name: string): string => {
    if (name.length <= maxLength) return name;

    const extIndex = name.lastIndexOf('.');
    if (extIndex <= 0 || extIndex >= name.length - 1) {
      // No extension or weird name → just cut in middle
      const half = Math.floor(maxLength / 2);
      return name.slice(0, half) + '...' + name.slice(-half);
    }

    const namePart = name.slice(0, extIndex);
    const ext = name.slice(extIndex);

    const charsForName = maxLength - ext.length - 3; // 3 for "..."
    if (charsForName <= 6) {
      // Very long extension or tiny space → simple truncate
      return name.slice(0, maxLength - 3) + '...';
    }

    return namePart.slice(0, charsForName) + '...' + ext;
  };

  const content = (
    <div
      onDoubleClick={() => onOpen(file)}
      onClick={(e) => onClick?.(file, e)}
      className={`flex flex-col items-center rounded-lg select-none py-4    w-24   ${
        isSelected ? 'bg-(--bg-tertiary)' : 'hover:bg-(--bg-tertiary)'
      }`}
      title={file.name}
    >
      {file.isDir ? (
        <div className="text-(--accent) mb-2 ">
          <Folder className="w-16 h-16 fill-(--accent)" />
        </div>
      ) : (
        getIconForFile({
          fileName: `${file.name}`,
          className: 'w-16 h-16 text-(--accent) mb-2 ',
        })
      )}

      <span className="text-xs text-center text-(--text-primary) w-full wrap-break-word line-clamp-2 ">
        {truncate(file.name)}
      </span>
    </div>
  );

  // If context menu items are provided, wrap in ContextMenu
  if (contextMenuItems) {
    return (
      <ContextMenu onOpen={handleContextOpen} items={contextMenuItems}>
        {content}
      </ContextMenu>
    );
  }

  return content;
}
