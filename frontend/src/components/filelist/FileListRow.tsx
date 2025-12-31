import { Row, flexRender } from '@tanstack/react-table';
import { VirtualItem } from '@tanstack/react-virtual';
import { FileInfo } from '../../../bindings/lazydir/internal';
import { ContextMenu } from '../ContextMenu';
import { useFileContextMenu } from '../../hooks/useFileContextMenu';
import { useTabsStore } from '../../store/tabsStore';

interface FileListRowProps {
  virtualRow: VirtualItem;
  row: Row<FileInfo>;
  file: FileInfo;
  gridCols: string;
  onOpen: (file: FileInfo) => void;
  onClick: (file: FileInfo, e: React.MouseEvent) => void;
  paneId: string;
  tabId: string;
}

export function FileListRow({
  virtualRow,
  row,
  file,
  gridCols,
  onOpen,
  onClick,
  paneId,
  tabId,
}: FileListRowProps) {
  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tabId, paneId)!.selectedFilePaths
  );
  const isSelected = selectedFilePaths?.has(file.path);
  const { contextMenuItems, handleContextOpen } = useFileContextMenu({
    file,
    selectedFilePaths,
    onOpen,
    tabId,
    paneId,
  });

  return (
    <div
      className={`absolute top-0 left-0 w-full rounded-md select-none`}
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <div
        onDoubleClick={() => onOpen(file)}
        onClick={(e) => onClick(file, e)}
        // onMouseDown={(e) => {
        // !!! breaks the right click unselect, but makes a faster feeling
        //   e.preventDefault();

        //   // Only handle LEFT click here (button 0)
        //   if (e.button !== 0) return;

        //   // Optional: prevent default if you need to stop text selection, etc.

        //   // Forward to the same logic as before
        //   onClick(file, e);
        // }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClick(file, e); // ← triggers selection + menu opens
        }}
        className={`w-full   grid ${gridCols} items-center text-left min-w-0 w-full rounded-b-md ${
          isSelected ? 'bg-(--bg-tertiary)' : ''
        }`}
      >
        {row.getVisibleCells().map((cell) => (
          <ContextMenu key={cell.id} onOpen={handleContextOpen} items={contextMenuItems}>
            <div className="min-w-0 text-left select-none text-(--text-primary) py-2">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
}
